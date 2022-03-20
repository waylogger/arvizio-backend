"use strict";

module.exports = async function (fastify, opts) {
  fastify.register(require("./example"), { prefix: "example" });
  fastify.register(require("./model-upload"), { prefix: "model-upload" });
  fastify.register(require("./picture-upload"), { prefix: "picture-upload" });
  fastify.register(require("./media-upload"), { prefix: "media-upload" });
  fastify.register(require("./get-first-pic"), { prefix: "get-first-pic" });
  fastify.register(require("./get-gallery"), { prefix: "get-gallery" });
  fastify.register(require("./get-media-gallery"), {
    prefix: "get-media-gallery",
  });
  fastify.register(require("./delete-pic"), { prefix: "delete-pic" });
  fastify.register(require("./delete-media"), { prefix: "delete-media" });
  fastify.register(require("./save-360-project"), {
    prefix: "save-360-project",
  });
  fastify.register(require("./get-360-project"), { prefix: "get-360-project" });
  fastify.register(require("./check-project-name"), {
    prefix: "check-project-name",
  });
  fastify.register(require("./post-logo"), { prefix: "post-logo" });
  fastify.register(require("./get-logo-filename"), {
    prefix: "get-logo-filename",
  });
  fastify.register(require("./save-rotation-settings"), {
    prefix: "save-rotation-settings",
  });
  fastify.register(require("./save-back-link"), { prefix: "save-back-link" });
  fastify.register(require("./get-project-settings"), {
    prefix: "get-project-settings",
  });
  fastify.register(require("./change-media-order"), {
    prefix: "change-media-order",
  });
};
