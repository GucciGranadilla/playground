import string from "../custom/string";
import media from "../custom/media";
import link from "../custom/link";

const textImageBlock = {
  name: "textImageBlock",
  title: "Text + Image Block",
  type: "object",
  fields: [
    string({
      name: "tag",
      title: "Tag",
      description: "Small label above the body text.",
      required: true,
    }),
    string({
      name: "title",
      title: "Title",
      description: "Large headline, animated with SplitText.",
      required: true,
    }),
    {
      name: "text",
      title: "Body text",
      type: "text",
      rows: 4,
    },
    media({
      name: "image",
      title: "Image",
      required: true,
    }),
    link({ name: "link", title: "Link" }),
  ],
  preview: {
    select: {
      title: "title",
      tag: "tag",
      media: "image",
    },
    prepare({
      title,
      tag,
      media,
    }: {
      title?: string;
      tag?: string;
      media?: any;
    }) {
      return {
        title: title || "Text + Image Block",
        subtitle: tag,
        media,
      };
    },
  },
};

export default textImageBlock;
