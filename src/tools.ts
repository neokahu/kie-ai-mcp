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

  // --- Ideogram V3 Text-to-Image ---
  ideogram_v3_generate: {
    name: "ideogram_v3_generate",
    description:
      "Generate images using Ideogram V3 text-to-image. Excellent for flat design, illustrations, typography, logos, and stylized graphics. Supports style codes, MagicPrompt enhancement, and negative prompts. Pricing: 3.5 credits (Turbo), 7 (Balanced), 10 (Quality).",
    model: "ideogram/v3-text-to-image",
    schema: {
      prompt: z
        .string()
        .min(1)
        .describe("Description of the image to generate"),
      rendering_speed: z
        .enum(["TURBO", "BALANCED", "QUALITY"])
        .default("BALANCED")
        .describe("Rendering speed: TURBO (fast), BALANCED (default), QUALITY (best)"),
      style: z
        .enum(["AUTO", "GENERAL", "REALISTIC", "DESIGN"])
        .default("AUTO")
        .describe("Style type"),
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
      seed: z.number().optional().describe("Seed for reproducible results"),
      negative_prompt: z
        .string()
        .optional()
        .describe("What to exclude from the image"),
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
      prompt: z.string().min(1).describe("Prompt to fill the masked area"),
      image_url: z.string().url().describe("Source image URL (must match mask dimensions)"),
      mask_url: z.string().url().describe("Mask image URL (black=modify, white=preserve)"),
      rendering_speed: z
        .enum(["TURBO", "BALANCED", "QUALITY"])
        .default("BALANCED")
        .describe("Rendering speed"),
      expand_prompt: z
        .boolean()
        .default(true)
        .describe("Use MagicPrompt enhancement"),
      seed: z.number().optional().describe("Seed for reproducible results"),
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
      prompt: z.string().min(1).describe("Prompt to remix the image with"),
      image_url: z.string().url().describe("Source image URL to remix"),
      rendering_speed: z
        .enum(["TURBO", "BALANCED", "QUALITY"])
        .default("BALANCED")
        .describe("Rendering speed"),
      style: z
        .enum(["AUTO", "GENERAL", "REALISTIC", "DESIGN"])
        .default("AUTO")
        .describe("Style type"),
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
      seed: z.number().optional().describe("Seed for reproducible results"),
      strength: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("How much original image is preserved (0=full change, 1=minimal change)"),
      negative_prompt: z
        .string()
        .optional()
        .describe("What to exclude from the image"),
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
      image_url: z.string().url().describe("Source image URL to reframe"),
      image_size: z
        .enum([
          "square", "square_hd", "portrait_4_3", "portrait_16_9",
          "landscape_4_3", "landscape_16_9",
        ])
        .default("square_hd")
        .describe("Target size/aspect"),
      num_images: z
        .enum(["1", "2", "3", "4"])
        .default("1")
        .describe("Number of images"),
      rendering_speed: z
        .enum(["TURBO", "BALANCED", "QUALITY"])
        .default("BALANCED")
        .describe("Rendering speed"),
      style: z
        .enum(["AUTO", "GENERAL", "REALISTIC", "DESIGN"])
        .default("AUTO")
        .describe("Style type"),
      seed: z.number().optional().describe("Seed for reproducible results"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Flux Kontext ---
  flux_kontext_image: {
    name: "flux_kontext_image",
    description:
      "Generate or edit images using Flux Kontext Pro/Max. Consistent style, accurate text rendering, and strong editing capabilities.",
    model: "flux-kontext-pro",
    schema: {
      prompt: z
        .string()
        .max(5000)
        .describe("Text prompt for generation or editing"),
      model: z
        .enum(["flux-kontext-pro", "flux-kontext-max"])
        .default("flux-kontext-pro")
        .describe("Model variant"),
      aspectRatio: z
        .enum(["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"])
        .default("16:9")
        .describe("Output aspect ratio"),
      inputImage: z
        .string()
        .url()
        .optional()
        .describe("Input image URL for editing mode"),
      outputFormat: z
        .enum(["jpeg", "png"])
        .default("jpeg")
        .describe("Output format"),
      promptUpsampling: z
        .boolean()
        .default(false)
        .describe("Enable prompt enhancement"),
      safetyTolerance: z
        .number()
        .min(0)
        .max(6)
        .default(2)
        .describe("Content moderation level (0-6)"),
      enableTranslation: z
        .boolean()
        .default(true)
        .describe("Auto-translate to English"),
    },
    buildInput(params: Record<string, unknown>) {
      const model = params.model || "flux-kontext-pro";
      delete params.model;
      return params;
    },
    getModel(params: Record<string, unknown>) {
      return (params.model as string) || "flux-kontext-pro";
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

  // --- Seedream (ByteDance) ---
  bytedance_seedream_image: {
    name: "bytedance_seedream_image",
    description:
      "Generate and edit images using ByteDance Seedream V4/V5 Lite. Enhanced detail fidelity, multi-image fusion, and clear text rendering.",
    model: "seedream-v4-text-to-image",
    schema: {
      prompt: z.string().max(5000).describe("Text prompt"),
      version: z
        .enum(["4", "5-lite"])
        .default("5-lite")
        .describe("Seedream version"),
      image_size: z
        .enum([
          "square", "square_hd", "portrait_4_3", "portrait_3_2",
          "portrait_16_9", "landscape_4_3", "landscape_3_2",
          "landscape_16_9", "landscape_21_9",
        ])
        .default("square_hd")
        .describe("Image aspect (V4 only)"),
      aspect_ratio: z
        .enum(["1:1", "4:3", "3:4", "16:9", "9:16", "2:3", "3:2", "21:9"])
        .default("1:1")
        .describe("Aspect ratio (V5 Lite only)"),
      image_resolution: z
        .enum(["1K", "2K", "4K"])
        .default("1K")
        .describe("Resolution (V4 only)"),
      quality: z
        .enum(["basic", "high"])
        .default("basic")
        .describe("V5 Lite quality: basic=2K, high=3K"),
      max_images: z
        .number()
        .min(1)
        .max(6)
        .default(1)
        .describe("Number of images (V4 only)"),
      image_urls: z
        .array(z.string().url())
        .max(14)
        .optional()
        .describe("Image URLs for editing mode"),
      seed: z.number().default(-1).describe("Random seed (-1 for random)"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      const version = params.version || "5-lite";
      const hasImages =
        params.image_urls && (params.image_urls as string[]).length > 0;
      if (version === "5-lite") {
        // V5 Lite model identifiers — adjust based on actual API
        return hasImages
          ? "seedream-v4.5-edit"
          : "seedream-v4.5-text-to-image";
      }
      return hasImages ? "seedream-v4-edit" : "seedream-v4-text-to-image";
    },
  },

  // --- OpenAI GPT-4o Image ---
  openai_4o_image: {
    name: "openai_4o_image",
    description:
      "Generate and edit images using OpenAI GPT-4o. Text-to-image, image editing with masks, and image variants.",
    model: "gpt-image/text-to-image",
    schema: {
      prompt: z.string().max(5000).optional().describe("Text prompt"),
      size: z
        .enum(["1:1", "3:2", "2:3"])
        .default("1:1")
        .describe("Aspect ratio"),
      filesUrl: z
        .array(z.string().url())
        .max(5)
        .optional()
        .describe("Image URLs for editing or variants"),
      maskUrl: z
        .string()
        .url()
        .optional()
        .describe("Mask image URL for precise editing"),
      nVariants: z
        .enum(["1", "2", "4"])
        .default("4")
        .describe("Number of variations"),
      enableFallback: z
        .boolean()
        .default(true)
        .describe("Enable fallback to backup models"),
      fallbackModel: z
        .enum(["GPT_IMAGE_1", "FLUX_MAX"])
        .default("FLUX_MAX")
        .describe("Backup model"),
      isEnhance: z
        .boolean()
        .default(false)
        .describe("Enable prompt enhancement"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Qwen Image ---
  qwen_image: {
    name: "qwen_image",
    description:
      "Generate and edit images using Qwen models. Text-to-image and image editing with bilingual prompt support.",
    model: "qwen-image/text-to-image",
    schema: {
      prompt: z.string().describe("Text prompt"),
      image_size: z
        .enum([
          "square", "square_hd", "portrait_4_3", "portrait_16_9",
          "landscape_4_3", "landscape_16_9",
        ])
        .default("square_hd")
        .describe("Image size"),
      image_url: z
        .string()
        .url()
        .optional()
        .describe("Image URL for editing mode"),
      negative_prompt: z
        .string()
        .max(500)
        .optional()
        .describe("Negative prompt"),
      guidance_scale: z
        .number()
        .min(0)
        .max(20)
        .default(2.5)
        .describe("CFG scale"),
      num_inference_steps: z
        .number()
        .min(2)
        .max(250)
        .default(30)
        .describe("Inference steps"),
      output_format: z
        .enum(["png", "jpeg"])
        .default("png")
        .describe("Output format"),
      num_images: z
        .enum(["1", "2", "3", "4"])
        .optional()
        .describe("Number of images (edit mode only)"),
      seed: z.number().optional().describe("Random seed"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      return params.image_url
        ? "qwen-image/image-to-image"
        : "qwen-image/text-to-image";
    },
  },

  // --- Z-Image ---
  z_image: {
    name: "z_image",
    description:
      "Generate photorealistic images using Z-Image. Ultra-fast Turbo, accurate bilingual text rendering (Chinese/English). ~$0.004/image.",
    model: "z-image/z-image",
    schema: {
      prompt: z.string().max(5000).describe("Text prompt (supports bilingual)"),
      aspect_ratio: z
        .enum(["1:1", "4:3", "3:4", "16:9", "9:16"])
        .default("1:1")
        .describe("Aspect ratio"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
  },

  // --- Grok Imagine ---
  grok_imagine: {
    name: "grok_imagine",
    description:
      "Generate images and videos using xAI's Grok Imagine. 4 modes: text-to-image, text-to-video, image-to-video, upscale. ~$0.10 per 6-second video.",
    model: "grok-imagine/text-to-image",
    schema: {
      prompt: z.string().max(5000).optional().describe("Text prompt"),
      aspect_ratio: z
        .enum(["2:3", "3:2", "1:1"])
        .default("1:1")
        .describe("Aspect ratio"),
      generation_mode: z
        .enum(["text-to-image", "text-to-video", "image-to-video", "upscale"])
        .optional()
        .describe("Mode (auto-detected if not set)"),
      mode: z
        .enum(["fun", "normal", "spicy"])
        .default("normal")
        .describe("Generation style"),
      image_urls: z
        .array(z.string().url())
        .max(1)
        .optional()
        .describe("Image URL for image-to-video"),
      task_id: z
        .string()
        .optional()
        .describe("Previous task ID for upscale/video from generated image"),
      index: z
        .number()
        .min(0)
        .max(5)
        .optional()
        .describe("Image index from task (Grok generates 6 per task)"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
    },
    getModel(params: Record<string, unknown>) {
      const mode =
        (params.generation_mode as string) ||
        (params.image_urls ? "image-to-video" : "text-to-image");
      return `grok-imagine/${mode}`;
    },
  },

  // --- Midjourney ---
  midjourney_generate: {
    name: "midjourney_generate",
    description:
      "Generate images and videos using Midjourney AI (v7, v6.1, v6, niji6). Text-to-image, image-to-image, style reference, omni reference, and video.",
    model: "midjourney/mj_txt2img",
    schema: {
      prompt: z.string().max(2000).describe("Text prompt"),
      version: z
        .enum(["7", "6.1", "6", "5.2", "5.1", "niji6"])
        .default("7")
        .describe("Midjourney model version"),
      aspectRatio: z
        .enum([
          "1:2", "9:16", "2:3", "3:4", "5:6", "6:5", "4:3", "3:2", "1:1",
          "16:9", "2:1",
        ])
        .default("16:9")
        .describe("Aspect ratio"),
      taskType: z
        .enum([
          "mj_txt2img", "mj_img2img", "mj_style_reference",
          "mj_omni_reference", "mj_video", "mj_video_hd",
        ])
        .optional()
        .describe("Task type (auto-detected if not set)"),
      speed: z
        .enum(["relaxed", "fast", "turbo"])
        .optional()
        .describe("Generation speed"),
      fileUrls: z
        .array(z.string().url())
        .max(10)
        .optional()
        .describe("Image URLs for img2img/video/style reference"),
      stylization: z
        .number()
        .min(0)
        .max(1000)
        .optional()
        .describe("Artistic style intensity"),
      variety: z
        .number()
        .min(0)
        .max(100)
        .optional()
        .describe("Diversity of results"),
      weirdness: z
        .number()
        .min(0)
        .max(3000)
        .optional()
        .describe("Creativity level"),
      enableTranslation: z
        .boolean()
        .default(false)
        .describe("Auto-translate to English"),
      motion: z
        .enum(["high", "low"])
        .default("high")
        .describe("Motion level for video"),
      videoBatchSize: z
        .enum(["1", "2", "4"])
        .default("1")
        .describe("Number of videos"),
      high_definition_video: z
        .boolean()
        .default(false)
        .describe("HD video generation"),
    },
    buildInput(params: Record<string, unknown>) {
      return { ...params };
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
