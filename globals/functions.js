"use strict";

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const { UPLOADS_FOLDER, FILES_PREFIX, ASSETS_PREFIX } = require("./constants");
const fs = require("fs");
const _ = require("lodash/array");
const sharp = require("sharp");

module.exports = Object.freeze({
  isFileExist: function (path) {
    return new Promise((resolve, reject) => {
      fs.access(path, (err) => {
        if (err) resolve(false);
        else resolve(true);
      });
    });
  },

  mkDir: function (path) {
    fs.mkdirSync(path);
  },

  createFolders: async function (sessionId) {
    const fsAccess = module.exports.isFileExist;
    let isUploadsFolderExists = await fsAccess(UPLOADS_FOLDER);
    if (!isUploadsFolderExists) {
      fs.mkdirSync(UPLOADS_FOLDER);
    }
    const path = `${UPLOADS_FOLDER}/${sessionId}`;
    isUploadsFolderExists = await fsAccess(path);
    if (!isUploadsFolderExists) {
      fs.mkdirSync(path);
    }
    return path;
  },

  fileList: function (dir) {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        const out = [];
        files.forEach((it) => {
          out.push(it);
        });
        resolve(out);
      });
    });
  },

  deleteFile: function (path) {
    return new Promise((resolve, reject) => {
      fs.unlink(path, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  deleteFolder: function (path) {
    return new Promise((resolve, reject) => {
      fs.rmdir(path, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  sortPictures: function (picList) {
    _.pullAllWith(picList, picList, (it) => it.substr(0, 3) !== "pic");
    picList.sort((a, b) => {
      const ai = a.match(/\d+/g)[0] - 0;
      const bi = b.match(/\d+/g)[0] - 0;
      return ai - bi;
    });
  },

  removeThumbnails: function (list) {
    _.pullAllWith(list, list, (it) => it.includes("-thumbnail."));
  },

  removeSettingsFromList: function (list) {
    _.pullAllWith(list, list, (it) => it === "settings.json");
    _.pullAllWith(list, list, (it) => it === "all-settings.json");
  },

  removeLogoFolderFromFileList: function (list) {
    _.pullAllWith(list, list, (it) => it === "project.logo");
  },

  /**
   * @param {string[]} list
   */
  removeBackgroundAudios: function (list) {
    _.pullAllWith(
      list,
      list,
      /**
       * @param {string} it
       * @return {boolean}
       */
      (it) => it.indexOf("-bg-audio.") > -1
    );
  },

  stringToFile: function (filePath, string) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, string, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  },

  objectToFileAsJson: async function (filePath, object) {
    const str = JSON.stringify(object);
    await module.exports.stringToFile(filePath, str);
  },

  readFile: function (filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  },

  readJsonFile: async function (filePath) {
    const data = await module.exports.readFile(filePath);
    return JSON.parse(data);
  },

  extractFileExtension: function (path, defaultExtension = "dat") {
    const fileSegments = path.split(".");
    return (
      fileSegments.length > 1
        ? fileSegments[fileSegments.length - 1]
        : defaultExtension
    ).toLowerCase();
  },

  abandonFileExtension: function (fileName) {
    const fileSegments = fileName.split(".");
    if (fileSegments.length > 1) {
      fileSegments.splice(fileSegments.length - 1, 1);
      return fileSegments.join(".");
    }
    return fileName;
  },

  constructThumbFileName: function (filename) {
    const segments = filename.split(".");
    let partA;
    if (segments.length === 2) {
      partA = segments[0];
    }
    if (segments.length > 2) {
      segments.pop();
      partA = segments.join(".");
    }
    return `${partA}-thumbnail.jpg`;
  },

  legacyConstructThumbFileName: function (fileName) {
    const segments = fileName.split(".");
    const partA = segments[0];
    return `${partA}-thumbnail.jpg`;
  },

  /**
   * @param {String} filename
   * @param {String} id
   * @param {ImageSetting} setting
   */
  convertFileNameToObject: async function (filename, id, setting) {
    const extractFileExtension = module.exports.extractFileExtension;
    const isFileExist = module.exports.isFileExist;
    const constructThumbFileName = module.exports.constructThumbFileName;
    const legacyConstructThumbFileName =
      module.exports.legacyConstructThumbFileName;
    const abandonFileExtension = module.exports.abandonFileExtension;
    const localFilePath = `${UPLOADS_FOLDER}/${id}/${filename}`;
    const ext = extractFileExtension(localFilePath);
    let thumb = `${FILES_PREFIX}${id}/${filename}`;
    let main = `${FILES_PREFIX}${id}/${filename}`;
    const mediaName = filename;
    let photos360 = null;
    let photos450 = null;
    let bgAudio = null;
    const index = setting.index || 0;
    switch (ext) {
      case "mp4":
      case "jpg":
      case "jpeg":
      case "png":
        if (!(await isFileExist(constructThumbFileName(localFilePath)))) {
          thumb = legacyConstructThumbFileName(thumb);
        } else {
          thumb = constructThumbFileName(thumb);
        }
        if (
          ext !== "mp4" &&
          (await isFileExist(
            `${abandonFileExtension(localFilePath)}-bg-audio.mp3`
          ))
        ) {
          bgAudio = `${FILES_PREFIX}${id}/${abandonFileExtension(
            filename
          )}-bg-audio.mp3`;
        }
        break;
      case "mp3":
        thumb = `${ASSETS_PREFIX}music.png`;
        break;
      case "360":
      case "450":
        const fileList = module.exports.fileList;
        const fileList1 = await fileList(localFilePath);
        const outList = fileList1.map((filename) => `${main}/${filename}`);
        const filePathWithoutExt = abandonFileExtension(localFilePath);
        const fileNameWithoutExt = abandonFileExtension(filename);
        if (ext === "360") {
          photos360 = outList;
        } else {
          photos450 = outList;
        }
        thumb = outList[0];
        main = outList[0];
        if (await isFileExist(`${filePathWithoutExt}-bg-audio.mp3`)) {
          bgAudio = `${FILES_PREFIX}${id}/${fileNameWithoutExt}-bg-audio.mp3`;
        }
        break;
    }
    return {
      index,
      mediaName,
      main,
      thumb,
      panorama: setting ? setting.is360 : false,
      photos360,
      photos450,
      inversions: setting && setting.inversions,
      bgAudio,
      description: (setting && setting.description) || "",
    };
  },

  takeScreenshotFromVideo: function (videoPath, folderPath, thumbName) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .on("filenames", (filenames) => {
          console.log("Screenshots: " + filenames.join(", "));
        })
        .on("end", (a) => {
          console.log("Taking screenshot is finished!", a);
          resolve();
        })
        .on("error", (err) => {
          console.log("an error happened: " + err.message);
          reject(err);
        })
        .takeScreenshots(
          {
            count: 1,
            filename: thumbName,
            timemarks: ["0"],
            size: "180x120",
          },
          folderPath
        );
    });
  },

  createThumbnailForImage: function (picPath) {
    return new Promise((resolve, reject) => {
      sharp(picPath)
        .resize({ width: 180, height: 120 })
        .toFile(module.exports.constructThumbFileName(picPath), (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
    });
  },

  delay: function (time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  },

  clearFolder: async function (folderPath) {
    const fileList = module.exports.fileList;
    const files = await fileList(folderPath);
    if (files.length === 0) return;
    const deleteFile = module.exports.deleteFile;
    for (let i = 0; i < files.length; i++) {
      await deleteFile(`${folderPath}/${files[i]}`);
    }
  },
});
