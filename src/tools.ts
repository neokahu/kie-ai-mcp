// Tool definitions for all Kie.ai models
// Each tool maps to a createTask call with specific model identifier and input schema

import { z } from "zod";

// Re-export zod for use in tool registration
export { z };

// ============================================================
// Helper: common callback URL from env
// ============================================================
const callbackUrl = () => process.env.KIE_AI_CALLBACK_URL;

// ============================================================
// IMAGE GENERATION TOOLS
// ============================================================

export const imageTools = {
  // --- Nano Banana (Google Gemini) ---
  nano_banana_image: {
    name: "nano_banana_image",
    description:
      "Generate and edit images using Google's Gemini 3.1 Flash (Nano Banana 2). Supports text-to-image, image editing with up to 14 reference images, 4K output, Google Search grounding, and improved text rendering. Pricing: 8 credits/1K, 12/2K, 18/4K.",
    model: "nano-banana-2",
    schema: {
      prompt: z
        .string()
        .max(5000)
        .describe("Text prompt for image generation or editing"),
      aspect_ratio: z
        .enum([
          "1:1", "1:4", "1:8", "2:3", "3:2", "3:4", "4:1", "4:3", "4:5",
          "5:4", "8:1", "9:16", "16:9", "21:9", "auto",
        ])
        .default("1:1")
        .describe("Aspect ratio"),
      resolution: z
        .enum(["1K", "2K", "4K"])
        .default("1K")
        .describe("Output resolution"),
      output_format: z
        .enum(["png", "jpg"])
        .default("png")
        .describe("Output format"),
      google_search: z
        .boolean()
        .default(false)
        .describe("Enable Google Search grounding for factual generation"),
      image_input: z
        .array(z.string().url())
        .max(14)
        .optional()
        .describe("Reference image URLs for editing mode (up to 14)"),
    },
    buildInput(params: Record<string, unknown>) {
      const input: Record<string, unknown> = { prompt: params.prompt };
      if (params.aspect_ratio) input.aspect_ratio = params.aspect_ratio;
      if (params.resolution) input.resolution = params.resolution;
      if (params.output_format) input.output_format = params.output_format;
      if (params.google_search) input.google_search = params.google_search;
      if (params.image_input) input.image_input = params.image_input;
      return input;
    },
  },

  // --- Nano Banana Pro (Google Gemini) ---
  nano_banana_pro_image: {
    name: "nano_banana_pro_image",
    description:
      "Generate and edit images using Nano Banana Pro. Supports text-to-image with up to 10,000 character prompts, image editing with up to 8 reference images, 4K output. Pricing: 8 credits/1K, 12/2K, 18/4K.",
    model: "nano-banana-pro",
    schema: {
      prompt: z
        .string()
        .max(10000)
        .describe("Text prompt for image generation or editing"),
      aspect_ratio: z
        .enum([
          "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9",
          "21:9", "auto",
        ])
        .default("1:1")
        .describe("Aspect ratio"),
      resolution: z
        .enum(["1K", "2K", "4K"])
        .default("1K")
        .describe("Output resolution"),
      output_format: z
        .enum(["png", "jpg"])
        .default("png")
        .describe("Output format"),
      image_input: z
        .array(z.string().url())
        .max(8)
        .optional()
        .describe("Reference image URLs for editing mode (up to 8)"),
    },
    buildInput(params: Record<string, unknown>) {
      const input: Record<string, unknown> = { prompt: params.prompt };
      if (params.aspect_ratio) input.aspect_ratio = params.aspect_ratio;
      if (params.resolution) input.resolution = params.resolution;
      if (params.output_format) input.output_format = params.output_format;
      if (params.image_input) input.image_input = params.image_input;
      return input;
    },
  },

  // --- Nano Banana Edit ---
  nano_banana_edit: {
    name: "nano_banana_edit",
    description:
      "Edit images using Nano Banana Edit. Requires at least one input image and a prompt describing the edit. Supports up to 10 reference images.",
    model: "google/nano-banana-edit",
    schema: {
      prompt: z
        .string()
        .max(5000)
        .describe("Prompt describing the desired edit"),
      image_urls: z
        .array(z.string().url())
        .min(1)
        .max(10)
        .describe("Input image URLs for editing (up to 10)"),
      output_format: z
        .enum(["png", "jpeg"])
        .default("png")
        .describe("Output format"),
      image_size: z
        .enum(["1:1", "9:16", "16:9", "3:4", "4:3", "3:2", "2:3", "5:4", "4:5", "21:9", "auto"])
        .default("1:1")
        .describe("Aspect ratio of the output image"),
    },
    buildInput(params: Record<string, unknown>) {
      const input: Record<string, unknown> = {
        prompt: params.prompt,
        image_urls: params.image_urls,
      };
      if (params.output_format) input.output_format = params.output_format;
      if (params.image_size) input.image_size = params.image_size;
      return input;
    },
  },

  // --- Google Imagen 4 ---
  google_imagen4: {
    name: "google_imagen4",
    description:
      "Generate images using Google Imagen 4 Ultra. High-quality text-to-image generation with negative prompts and seed support. Uses standard task endpoint.",
    model: "google/imagen4",
    schema: {
      prompt: z
        .string()
        .max(5000)
        .describe("Text prompt describing the image to generate"),
      negative_prompt: z
        .string()
        .max(5000)
        .optional()
        .describe("What to discourage in the generated image"),
      aspect_ratio: z
        .enum(["1:1", "16:9", "9:16", "3:4", "4:3"])
        .default("1:1")
        .describe("Aspect ratio of the generated image"),
      seed: z
        .string()
        .max(500)
        .optional()
        .describe("Random seed for reproducible generation"),
    },
    buildInput(params: Record<string, unknown>) {
      return {
        prompt: params.prompt,
        negative_prompt: (params.negative_prompt as string) || "",
        aspect_ratio: (params.aspect_ratio as string) || "1:1",
        seed: (params.seed as string) || "",
      };
    },
  },

  // --- Google Imagen 4 Ultra ---
  google_imagen4_ultra: {
    name: "google_imagen4_ultra",
    description:
      "Generate images using Google Imagen 4 Ultra. Premium quality text-to-image generation with negative prompts and seed support. Uses standard task endpoint.",
    model: "google/imagen4-ultra",
    schema: {
      prompt: z
        .string()
        .max(5000)
        .describe("Text prompt describing the image to generate"),
      negative_prompt: z
        .string()
        .max(5000)
        .optional()
        .describe("What to discourage in the generated image"),
      aspect_ratio: z
        .enum(["1:1", "16:9", "9:16", "3:4", "4:3"])
        .default("1:1")
        .describe("Aspect ratio of the generated image"),
      seed: z
        .string()
        .max(500)
        .optional()
        .describe("Random seed for reproducible generation"),
    },
    buildInput(params: Record<string, unknown>) {
      return {
        prompt: params.prompt,
        negative_prompt: (params.negative_prompt as string) || "",
        aspect_ratio: (params.aspect_ratio as string) || "1:1",
        seed: (params.seed as string) || "",
      };
    },
  },

  // --- Ideogram V3 Text-to-Image ---
  ideogram_v3_generate: {
    name: "ideogram_v3_generate",
    description:
      "Generate images using Ideogram V3 text-to-image. Excellent for flat design, illustrations, typography, logos, and stylized graphics. Supports style codes, MagicPrompt enhancement, and negative prompts. Pricing: 3.5 credits (Turbo), 7 (Balanced), 10 (Quality).",
    model: "ideogram/v3-text-to-image",
    schema: {
      prompt: z
        .string()
        .max(5000)
        .describe("Description of the image to generate"),
      rendering_speed: z
        .enum(["TURBO", "BALANCED", "QUALITY"])
        .default("BALANCED")
        .describe("Rendering speed: TURBO (fast), BALANCED (default), QUALITY (best)"),
      style: z
        .enum(["AUTO", "GENERAL", "REALISTIC", "DESIGN"])
        .optional()
        .describe("Style type. Cannot be used together with style_code"),
      expand_prompt: z
        .boolean()
        .default(true)
        .describe("Use MagicPrompt to enhance the prompt"),
      image_size: z
        .enum([
          "square", "square_hd", "portrait_4_3", "portrait_16_9",
          "landscape_4_3", "landscape_16_9",
        ])
        .default("square_hd")
        .describe("Output image resolution/aspect"),
      seed: z.number().int().optional().describe("Seed for the random number generator"),
      negative_prompt: z
        .string()
        .max(5000)
        .optional()
        .describe("What to exclude from the image. Positive prompt takes precedence if conflicting"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Ideogram V3 Edit ---
  ideogram_v3_edit: {
    name: "ideogram_v3_edit",
    description:
      "Edit images using Ideogram V3 with mask-based inpainting. Modify specific regions while keeping the rest unchanged. Great for background replacement, object editing, and detail adjustments.",
    model: "ideogram/v3-edit",
    schema: {
      prompt: z.string().max(5000).describe("Prompt to fill the masked area"),
      image_url: z.string().url().describe("Source image URL. Must match mask dimensions (jpeg/png/webp, max 10MB)"),
      mask_url: z.string().url().describe("Mask image URL for inpainting. Must match source image dimensions (jpeg/png/webp, max 10MB)"),
      rendering_speed: z
        .enum(["TURBO", "BALANCED", "QUALITY"])
        .default("BALANCED")
        .describe("Rendering speed"),
      expand_prompt: z
        .boolean()
        .default(true)
        .describe("Use MagicPrompt enhancement"),
      seed: z.number().int().optional().describe("Seed for the random number generator"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Ideogram V3 Remix ---
  ideogram_v3_remix: {
    name: "ideogram_v3_remix",
    description:
      "Remix images using Ideogram V3. Transform an existing image with a new prompt while controlling how much of the original is preserved via strength parameter. Great for style transfers and creative variations.",
    model: "ideogram/v3-remix",
    schema: {
      prompt: z.string().max(5000).describe("Prompt to remix the image with"),
      image_url: z.string().url().describe("Source image URL to remix (jpeg/png/webp, max 10MB)"),
      rendering_speed: z
        .enum(["TURBO", "BALANCED", "QUALITY"])
        .default("BALANCED")
        .describe("Rendering speed"),
      style: z
        .enum(["AUTO", "GENERAL", "REALISTIC", "DESIGN"])
        .optional()
        .describe("Style type. Cannot be used together with style_code"),
      expand_prompt: z
        .boolean()
        .default(true)
        .describe("Use MagicPrompt enhancement"),
      image_size: z
        .enum([
          "square", "square_hd", "portrait_4_3", "portrait_16_9",
          "landscape_4_3", "landscape_16_9",
        ])
        .default("square_hd")
        .describe("Output resolution/aspect"),
      num_images: z
        .enum(["1", "2", "3", "4"])
        .default("1")
        .describe("Number of images to generate"),
      seed: z.number().int().optional().describe("Seed for the random number generator"),
      strength: z
        .number()
        .min(0.01)
        .max(1)
        .optional()
        .describe("Strength of the input image in the remix (0.01-1)"),
      negative_prompt: z
        .string()
        .max(5000)
        .optional()
        .describe("What to exclude from the image. Positive prompt takes precedence if conflicting"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Ideogram V3 Reframe ---
  ideogram_v3_reframe: {
    name: "ideogram_v3_reframe",
    description:
      "Reframe images to different aspect ratios using Ideogram V3. Extends content via intelligent outpainting while preserving the subject. Ideal for adapting images across social media formats.",
    model: "ideogram/v3-reframe",
    schema: {
      image_url: z.string().url().describe("Source image URL to reframe (jpeg/png/webp, max 10MB)"),
      image_size: z
        .enum([
          "square", "square_hd", "portrait_4_3", "portrait_16_9",
          "landscape_4_3", "landscape_16_9",
        ])
        .describe("Target resolution/aspect for the reframed output"),
      rendering_speed: z
        .enum(["TURBO", "BALANCED", "QUALITY"])
        .default("BALANCED")
        .describe("Rendering speed"),
      style: z
        .enum(["AUTO", "GENERAL", "REALISTIC", "DESIGN"])
        .optional()
        .describe("Style type. Cannot be used together with style_code"),
      num_images: z
        .enum(["1", "2", "3", "4"])
        .default("1")
        .describe("Number of images to generate"),
      seed: z.number().int().optional().describe("Seed for the random number generator"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Flux 2 ---
  flux2_image: {
    name: "flux2_image",
    description:
      "Generate images using Flux 2 Pro/Flex. Multi-reference consistency, photoreal detail, and accurate text rendering.",
    model: "flux-2/pro-text-to-image",
    schema: {
      prompt: z.string().min(3).max(5000).describe("Text prompt"),
      model_type: z
        .enum(["pro", "flex"])
        .default("pro")
        .describe("Model variant"),
      aspect_ratio: z
        .enum(["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "auto"])
        .default("1:1")
        .describe("Aspect ratio"),
      resolution: z
        .enum(["1K", "2K"])
        .default("1K")
        .describe("Output resolution"),
      input_urls: z
        .array(z.string().url())
        .max(8)
        .optional()
        .describe("Reference images for image-to-image (1-8 URLs)"),
    },
    buildInput(params: Record<string, unknown>) {
      const { model_type, input_urls, ...rest } = params as {
        model_type?: string;
        input_urls?: string[];
        [key: string]: unknown;
      };
      if (input_urls) rest.input_urls = input_urls;
      return rest;
    },
    getModel(params: Record<string, unknown>) {
      const type = (params.model_type as string) || "pro";
      const hasInput = params.input_urls && (params.input_urls as string[]).length > 0;
      return `flux-2/${type}-${hasInput ? "image-to-image" : "text-to-image"}`;
    },
  },

  // --- OpenAI GPT-4o Image ---
  openai_4o_image: {
    name: "openai_4o_image",
    description:
      "Generate and edit images using OpenAI GPT-4o. Text-to-image, image editing with masks. Uses dedicated /gpt4o-image endpoint. Use get_task_status with source='gpt4o' to check results.",
    model: "gpt4o-image",
    isGpt4o: true,
    schema: {
      prompt: z.string().describe("Text prompt for image generation or editing"),
      size: z
        .enum(["1:1", "3:2", "2:3"])
        .default("1:1")
        .describe("Aspect ratio"),
      filesUrl: z
        .array(z.string().url())
        .optional()
        .describe("Image URLs for editing or reference"),
      maskUrl: z
        .string()
        .url()
        .optional()
        .describe("Mask image URL — white areas are preserved, black areas are modified"),
      isEnhance: z
        .boolean()
        .default(false)
        .describe("Enable prompt enhancement for more refined outputs (e.g. 3D renders)"),
      uploadCn: z
        .boolean()
        .default(false)
        .describe("Route uploads via China servers (true) or non-China servers (false)"),
      enableFallback: z
        .boolean()
        .default(false)
        .describe("Activate automatic fallback to backup model if GPT-4o is unavailable"),
      fallbackModel: z
        .enum(["GPT_IMAGE_1", "FLUX_MAX"])
        .default("FLUX_MAX")
        .describe("Backup model when enableFallback is true"),
    },
    buildInput(params: Record<string, unknown>) {
      const input: Record<string, unknown> = { prompt: params.prompt };
      if (params.size) input.size = params.size;
      if (params.filesUrl) input.filesUrl = params.filesUrl;
      if (params.maskUrl) input.maskUrl = params.maskUrl;
      if (params.isEnhance !== undefined) input.isEnhance = params.isEnhance;
      if (params.uploadCn !== undefined) input.uploadCn = params.uploadCn;
      if (params.enableFallback !== undefined) input.enableFallback = params.enableFallback;
      if (params.fallbackModel) input.fallbackModel = params.fallbackModel;
      return input;
    },
  },

  // --- Topaz Upscale ---
  topaz_upscale_image: {
    name: "topaz_upscale_image",
    description:
      "Upscale and enhance images using Topaz Labs AI. 1x-8x upscaling with detail restoration. Max 20,000px. Pricing: 10 credits (≤2K), 20 (4K), 40 (8K).",
    model: "topaz/image-upscale",
    schema: {
      image_url: z.string().url().describe("Image URL to upscale"),
      upscale_factor: z
        .enum(["1", "2", "4", "8"])
        .default("2")
        .describe("Upscale factor"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Recraft Remove Background ---
  recraft_remove_background: {
    name: "recraft_remove_background",
    description: "Remove background from images using Recraft AI.",
    model: "recraft/remove-background",
    schema: {
      image_url: z.string().url().describe("Image URL to process"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Recraft Crisp Upscale ---
  recraft_crisp_upscale: {
    name: "recraft_crisp_upscale",
    description:
      "Upscale images using Recraft Crisp Upscale. Enhances image resolution with crisp detail preservation.",
    model: "recraft/crisp-upscale",
    schema: {
      image: z.string().url().describe("Image URL to upscale (jpeg/png/webp, max 10MB)"),
    },
    buildInput(params: Record<string, unknown>) {
      return { image: params.image };
    },
  },
};

// ============================================================
// VIDEO GENERATION TOOLS
// ============================================================

export const videoTools = {
  // --- Kling ---
  kling_video: {
    name: "kling_video",
    description:
      "Generate videos using Kling AI models (v2.6, v3.0). Text-to-video and image-to-video with motion control.",
    model: "kling-2.6/text-to-video",
    schema: {
      prompt: z.string().describe("Text prompt for video"),
      version: z
        .enum(["2.6", "3.0"])
        .default("2.6")
        .describe("Kling version"),
      image_url: z
        .string()
        .url()
        .optional()
        .describe("Image URL for image-to-video"),
      duration: z
        .enum(["5", "10"])
        .default("5")
        .describe("Video duration in seconds"),
      aspect_ratio: z
        .enum(["16:9", "9:16", "1:1"])
        .default("16:9")
        .describe("Aspect ratio"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      const v = params.version || "2.6";
      const hasImage = !!params.image_url;
      if (v === "3.0") return "kling-3.0";
      return hasImage
        ? `kling-${v}/image-to-video`
        : `kling-${v}/text-to-video`;
    },
  },

  // --- Kling Avatar ---
  kling_avatar: {
    name: "kling_avatar",
    description:
      "Generate AI avatar videos using Kling. Standard and pro quality.",
    model: "kling/ai-avatar-standard",
    schema: {
      prompt: z.string().describe("Text/script for the avatar"),
      image_url: z.string().url().describe("Portrait image URL"),
      quality: z
        .enum(["standard", "pro"])
        .default("standard")
        .describe("Quality level"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      return `kling/ai-avatar-${params.quality || "standard"}`;
    },
  },

  // --- ByteDance Seedance ---
  bytedance_seedance_video: {
    name: "bytedance_seedance_video",
    description:
      "Generate videos using ByteDance Seedance. Text-to-video and image-to-video with lite/pro quality.",
    model: "bytedance/v1-lite-text-to-video",
    schema: {
      prompt: z.string().max(10000).describe("Text prompt"),
      quality: z
        .enum(["lite", "pro"])
        .default("lite")
        .describe("Quality level"),
      image_url: z
        .string()
        .url()
        .optional()
        .describe("Image URL for image-to-video"),
      end_image_url: z
        .string()
        .url()
        .optional()
        .describe("End frame image URL"),
      duration: z.string().default("5").describe("Duration 2-12 seconds"),
      resolution: z
        .enum(["480p", "720p", "1080p"])
        .default("720p")
        .describe("Video resolution"),
      aspect_ratio: z
        .enum(["1:1", "9:16", "16:9", "4:3", "3:4", "21:9", "9:21"])
        .default("16:9")
        .describe("Aspect ratio"),
      camera_fixed: z.boolean().default(false).describe("Fix camera position"),
      seed: z.number().default(-1).describe("Random seed"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      const q = params.quality || "lite";
      const hasImage = !!params.image_url;
      return `bytedance/v1-${q}-${hasImage ? "image" : "text"}-to-video`;
    },
  },

  // --- Hailuo ---
  hailuo_video: {
    name: "hailuo_video",
    description:
      "Generate videos using Hailuo AI. Text-to-video and image-to-video with standard/pro quality.",
    model: "hailuo/02-text-to-video-standard",
    schema: {
      prompt: z.string().describe("Text prompt"),
      quality: z
        .enum(["standard", "pro"])
        .default("standard")
        .describe("Quality level"),
      image_url: z
        .string()
        .url()
        .optional()
        .describe("Image URL for image-to-video"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      const q = params.quality || "standard";
      const hasImage = !!params.image_url;
      return `hailuo/02-${hasImage ? "image" : "text"}-to-video-${q}`;
    },
  },

  // --- Sora ---
  sora_video: {
    name: "sora_video",
    description:
      "Generate videos using OpenAI Sora 2. Text-to-video and image-to-video.",
    model: "sora2/text-to-video",
    schema: {
      prompt: z.string().describe("Text prompt"),
      quality: z
        .enum(["standard", "pro"])
        .default("standard")
        .describe("standard=sora2, pro=sora2-pro"),
      image_url: z
        .string()
        .url()
        .optional()
        .describe("Image URL for image-to-video"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      const model = params.quality === "pro" ? "sora2-pro" : "sora2";
      const hasImage = !!params.image_url;
      return `${model}/${hasImage ? "image" : "text"}-to-video`;
    },
  },

  // --- Veo3 ---
  veo3_generate_video: {
    name: "veo3_generate_video",
    description:
      "Generate professional videos using Google Veo3. Text-to-video and image-to-video.",
    model: "veo3/text-to-video",
    schema: {
      prompt: z.string().max(2000).describe("Text prompt"),
      model: z
        .enum(["veo3", "veo3_fast"])
        .default("veo3")
        .describe("veo3 (quality) or veo3_fast (cost-efficient)"),
      aspectRatio: z
        .enum(["16:9", "9:16", "Auto"])
        .default("16:9")
        .describe("Aspect ratio"),
      imageUrls: z
        .array(z.string().url())
        .max(2)
        .optional()
        .describe("Image URLs for image-to-video (1-2 images)"),
      enableTranslation: z
        .boolean()
        .default(true)
        .describe("Auto-translate to English"),
      enableFallback: z
        .boolean()
        .default(false)
        .describe("Fallback on content policy failures"),
      seeds: z
        .number()
        .min(10000)
        .max(99999)
        .optional()
        .describe("Random seed"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Wan 2.7 Image ---
  wan_image: {
    name: "wan_image",
    description:
      "Generate and edit images using Wan 2.7 Image. Text-to-image with optional image input for editing. Supports thinking mode, sequential/group mode, custom color palettes with ratios, and interactive bbox editing.",
    model: "wan/2-7-image",
    schema: {
      prompt: z.string().max(5000).describe("Text prompt for image generation or editing"),
      input_urls: z
        .array(z.string().url())
        .max(9)
        .optional()
        .describe("Input image URLs for editing mode"),
      aspect_ratio: z
        .enum(["1:1", "16:9", "4:3", "21:9", "3:4", "9:16", "8:1", "1:8"])
        .default("1:1")
        .optional()
        .describe("Output aspect ratio (text-to-image only, hidden when input_urls is provided)"),
      n: z
        .number()
        .min(1)
        .max(12)
        .default(4)
        .optional()
        .describe("Number of images: 1-4 (standard), 1-12 (sequential mode)"),
      enable_sequential: z
        .boolean()
        .default(false)
        .optional()
        .describe("Enable sequential/group image mode"),
      resolution: z
        .enum(["1K", "2K", "4K"])
        .default("2K")
        .optional()
        .describe("Output resolution (4K only for text-to-image standard mode)"),
      thinking_mode: z
        .boolean()
        .default(false)
        .optional()
        .describe("Enable thinking mode (only when sequential=false and no input_urls)"),
      color_palette: z
        .array(z.object({
          hex: z.string().describe("Hex color value"),
          ratio: z.string().describe("Color ratio/weight"),
        }))
        .min(3)
        .max(10)
        .optional()
        .describe("Custom color theme (3-10 colors, 8 recommended, only when sequential=false)"),
      bbox_list: z
        .array(z.array(z.array(z.number())))
        .optional()
        .describe("Interactive editing bounding boxes. Outer list matches input_urls; inner arrays are boxes [x1,y1,x2,y2]; max 2 boxes per image"),
      watermark: z
        .boolean()
        .default(false)
        .optional()
        .describe("Add watermark"),
      seed: z
        .number()
        .min(0)
        .max(2147483647)
        .default(0)
        .optional()
        .describe("Random seed (0 for random)"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Wan 2.7 Image Pro ---
  wan_image_pro: {
    name: "wan_image_pro",
    description:
      "Generate and edit images using Wan 2.7 Image Pro. Higher quality variant. Text-to-image with optional image input for editing. Supports thinking mode, sequential/group mode, custom color palettes, and interactive bbox editing.",
    model: "wan/2-7-image-pro",
    schema: {
      prompt: z.string().max(5000).describe("Text prompt for image generation or editing"),
      input_urls: z
        .array(z.string().url())
        .max(9)
        .optional()
        .describe("Input image URLs for editing mode"),
      aspect_ratio: z
        .enum(["1:1", "16:9", "4:3", "21:9", "3:4", "9:16", "8:1", "1:8"])
        .default("1:1")
        .optional()
        .describe("Output aspect ratio (text-to-image only, hidden when input_urls is provided)"),
      n: z
        .number()
        .min(1)
        .max(12)
        .default(4)
        .optional()
        .describe("Number of images: 1-4 (standard), 1-12 (sequential mode)"),
      enable_sequential: z
        .boolean()
        .default(false)
        .optional()
        .describe("Enable sequential/group image mode"),
      resolution: z
        .enum(["1K", "2K", "4K"])
        .default("2K")
        .optional()
        .describe("Output resolution (4K only for text-to-image standard mode)"),
      thinking_mode: z
        .boolean()
        .default(false)
        .optional()
        .describe("Enable thinking mode (only when sequential=false and no input_urls)"),
      color_palette: z
        .array(z.object({ color: z.string().describe("Hex color value") }))
        .min(3)
        .max(10)
        .optional()
        .describe("Custom color theme (3-10 colors, 8 recommended, only when sequential=false)"),
      bbox_list: z
        .array(z.array(z.number()))
        .optional()
        .describe("Interactive editing bounding boxes. Outer list matches input_urls; max 2 boxes per image; format [x1,y1,x2,y2]"),
      watermark: z
        .boolean()
        .default(false)
        .optional()
        .describe("Add watermark"),
      seed: z
        .number()
        .min(0)
        .max(2147483647)
        .default(0)
        .optional()
        .describe("Random seed (0 for random)"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Wan ---
  wan_video: {
    name: "wan_video",
    description:
      "Generate videos using Wan AI. Text-to-video, image-to-video, and video-to-video.",
    model: "wan/2-6-text-to-video",
    schema: {
      prompt: z.string().describe("Text prompt"),
      mode: z
        .enum(["text-to-video", "image-to-video", "video-to-video"])
        .default("text-to-video")
        .describe("Generation mode"),
      image_url: z
        .string()
        .url()
        .optional()
        .describe("Input image/video URL"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      const mode = params.mode || "text-to-video";
      return `wan/2-6-${mode}`;
    },
  },

  // --- Wan Animate ---
  wan_animate: {
    name: "wan_animate",
    description:
      "Animate images using Wan AI. Move or replace elements in images.",
    model: "wan/2-2-animate-move",
    schema: {
      prompt: z.string().describe("Animation description"),
      image_url: z.string().url().describe("Source image URL"),
      mode: z
        .enum(["move", "replace"])
        .default("move")
        .describe("Animation mode"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      return `wan/2-2-animate-${params.mode || "move"}`;
    },
  },

  // --- Runway Aleph ---
  runway_aleph_video: {
    name: "runway_aleph_video",
    description:
      "Generate videos using Runway Aleph. Uses separate Runway API endpoints.",
    model: "runway",
    schema: {
      prompt: z.string().describe("Text prompt"),
      image_url: z.string().url().optional().describe("Input image URL"),
      duration: z
        .enum(["5", "10"])
        .default("5")
        .describe("Video duration in seconds"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    isRunway: true,
  },

  // --- InfiniTalk Lip Sync ---
  infinitalk_lip_sync: {
    name: "infinitalk_lip_sync",
    description:
      "Create AI lip-sync talking videos. Portrait + audio → natural talking avatar. ~$0.015/s (480p), ~$0.06/s (720p), max 15s.",
    model: "infinitalk/from-audio",
    schema: {
      image_url: z.string().url().describe("Portrait image URL"),
      audio_url: z.string().url().describe("Audio file URL (max 10MB)"),
      prompt: z
        .string()
        .max(1500)
        .describe("Guide prompt (e.g., 'A woman talking on a podcast')"),
      resolution: z
        .enum(["480p", "720p"])
        .default("480p")
        .describe("Video resolution"),
      seed: z
        .number()
        .min(10000)
        .max(1000000)
        .optional()
        .describe("Random seed"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },
};

// ============================================================
// AUDIO TOOLS
// ============================================================

export const audioTools = {
  // --- Suno Music ---
  suno_generate_music: {
    name: "suno_generate_music",
    description:
      "Generate music using Suno AI. Create songs from text descriptions.",
    model: "suno/generate",
    schema: {
      prompt: z.string().describe("Music description or lyrics"),
      duration: z
        .number()
        .min(10)
        .max(240)
        .default(30)
        .describe("Duration in seconds"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- ElevenLabs TTS ---
  elevenlabs_tts: {
    name: "elevenlabs_tts",
    description:
      "Text-to-speech using ElevenLabs. High-quality natural speech synthesis.",
    model: "elevenlabs/text-to-speech-turbo-2-5",
    schema: {
      text: z.string().describe("Text to convert to speech"),
      voice_id: z.string().optional().describe("Voice ID"),
      model: z
        .enum([
          "text-to-speech-turbo-2-5",
          "text-to-speech-multilingual-v2",
          "text-to-dialogue-v3",
        ])
        .default("text-to-speech-turbo-2-5")
        .describe("TTS model"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      return `elevenlabs/${params.model || "text-to-speech-turbo-2-5"}`;
    },
  },

  // --- ElevenLabs Sound Effects ---
  elevenlabs_ttsfx: {
    name: "elevenlabs_ttsfx",
    description: "Generate sound effects using ElevenLabs.",
    model: "elevenlabs/sound-effect-v2",
    schema: {
      prompt: z.string().describe("Sound effect description"),
      duration: z
        .number()
        .min(1)
        .max(30)
        .optional()
        .describe("Duration in seconds"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },
};

// ============================================================
// UTILITY TOOLS
// ============================================================

export const utilityTools = {
  get_task_status: {
    name: "get_task_status",
    description:
      "Check the status of a generation task. Returns status, results, and polling guidance.",
    schema: {
      task_id: z.string().describe("Task ID to check"),
      source: z
        .enum(["auto", "common", "gpt4o"])
        .default("auto")
        .describe("Which API endpoint to query. Use 'auto' to detect from task ID format, or specify explicitly for GPT-4o and other dedicated endpoints."),
    },
  },

  list_tasks: {
    name: "list_tasks",
    description: "List recent generation tasks with their status.",
    schema: {
      limit: z
        .number()
        .min(1)
        .max(100)
        .default(20)
        .describe("Max tasks to return"),
      status: z
        .enum(["pending", "processing", "completed", "failed"])
        .optional()
        .describe("Filter by status"),
    },
  },

  get_credit_balance: {
    name: "get_credit_balance",
    description: "Check remaining Kie.ai credit balance.",
    schema: {},
  },
};
