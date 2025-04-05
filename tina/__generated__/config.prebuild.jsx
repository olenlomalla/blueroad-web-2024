// tina/config.ts
import { defineConfig } from "tinacms";
var config_default = defineConfig({
  branch: process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main",
  clientId: process.env.TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "blog",
        label: "Blog Posts",
        path: "src/content/blog",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            required: true
          },
          {
            type: "datetime",
            name: "publishedAt",
            label: "Published At",
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true,
            options: [
              "Product Management",
              "Design Sprint",
              "Agile",
              "Digital Product",
              "Training",
              "Case Studies",
              "Workshops",
              "Development"
            ]
          },
          {
            type: "string",
            name: "image",
            label: "Image"
          },
          {
            type: "string",
            name: "author",
            label: "Author"
          },
          {
            type: "string",
            list: true,
            name: "tags",
            label: "Tags"
          }
        ]
      },
      {
        name: "portfolio",
        label: "Case Studies",
        path: "src/content/portfolio",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            required: true
          },
          {
            type: "datetime",
            name: "publishedAt",
            label: "Published At",
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: false
          },
          {
            type: "string",
            name: "client",
            label: "Client Name",
            required: false,
            description: "Leave empty for NDA or classified projects"
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true,
            options: ["3D Visualization", "Unreal Engine", "Video Production", "Design Sprint", "Product Development"]
          },
          {
            type: "string",
            name: "image",
            label: "Cover Image",
            required: true
          },
          {
            type: "image",
            name: "gallery",
            label: "Image Gallery",
            list: true
          },
          {
            type: "string",
            list: true,
            name: "tags",
            label: "Tags"
          },
          {
            type: "rich-text",
            name: "body",
            label: "Case Study Content",
            required: true,
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
