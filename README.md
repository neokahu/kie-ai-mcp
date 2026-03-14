# Kie.ai MCP Server

MCP server for the [Kie.ai](https://kie.ai) API — unified access to 25+ AI models for image, video, and audio generation.

## Models

### Image
- **Nano Banana 2** (Google Gemini 3.1 Flash) — photorealistic, 4K, text rendering
- **Ideogram V3** — text-to-image, edit, remix, reframe (flat design, typography, logos)
- **Flux Kontext** Pro/Max — consistent style, editing
- **Flux 2** Pro/Flex — multi-reference, text rendering
- **Seedream** V4/V5 Lite — detail fidelity, text
- **GPT-4o Image** — versatile generation and variants
- **Qwen** — bilingual prompts
- **Z-Image** — ultra-fast, bilingual text
- **Grok Imagine** — image + video
- **Midjourney** v7/v6/niji6 — artistic, stylized
- **Topaz** — AI upscaling 1x-8x
- **Recraft** — background removal

### Video
- **Kling** 2.6/3.0 — text/image to video, avatars
- **Seedance** (ByteDance) — lite/pro quality
- **Hailuo** — standard/pro
- **Sora 2** — OpenAI video
- **Veo3** (Google) — professional quality
- **Wan** — text/image/video to video, animate
- **Runway Aleph** — video generation
- **InfiniTalk** — lip-sync talking avatars

### Audio
- **Suno** — AI music generation
- **ElevenLabs** — text-to-speech, sound effects

## Setup

```bash
npm install
npm run build
```

### Claude Code

```bash
claude mcp add kie-ai -- node /path/to/kie-ai-mcp/dist/index.js
```

Or add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "kie-ai": {
      "command": "node",
      "args": ["/path/to/kie-ai-mcp/dist/index.js"],
      "env": {
        "KIE_AI_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `KIE_AI_API_KEY` | Yes | API key from [kie.ai/api-key](https://kie.ai/api-key) |
| `KIE_AI_CALLBACK_URL` | No | Default webhook URL for task completion |

## Usage

All generation tools are async — they return a `taskId` immediately. Use `get_task_status` to poll for results.

```
1. Call a generation tool (e.g., ideogram_v3_generate)
2. Get back a taskId
3. Poll with get_task_status until state = "success"
4. Result URLs are in the response (expire after 14 days)
```

## Tools

| Tool | Type | Description |
|---|---|---|
| `nano_banana_image` | Image | Gemini 3.1 Flash generation/editing |
| `ideogram_v3_generate` | Image | Ideogram V3 text-to-image |
| `ideogram_v3_edit` | Image | Ideogram V3 mask-based editing |
| `ideogram_v3_remix` | Image | Ideogram V3 image remixing |
| `ideogram_v3_reframe` | Image | Ideogram V3 aspect ratio adaptation |
| `flux_kontext_image` | Image | Flux Kontext Pro/Max |
| `flux2_image` | Image | Flux 2 Pro/Flex |
| `bytedance_seedream_image` | Image | Seedream V4/V5 Lite |
| `openai_4o_image` | Image | GPT-4o image generation |
| `qwen_image` | Image | Qwen image generation |
| `z_image` | Image | Z-Image ultra-fast |
| `grok_imagine` | Image | Grok Imagine (image + video) |
| `midjourney_generate` | Image | Midjourney v7/v6/niji6 |
| `topaz_upscale_image` | Image | Topaz AI upscaling |
| `recraft_remove_background` | Image | Background removal |
| `kling_video` | Video | Kling 2.6/3.0 |
| `kling_avatar` | Video | Kling AI avatars |
| `bytedance_seedance_video` | Video | Seedance lite/pro |
| `hailuo_video` | Video | Hailuo standard/pro |
| `sora_video` | Video | Sora 2 / Sora 2 Pro |
| `veo3_generate_video` | Video | Google Veo3 |
| `wan_video` | Video | Wan text/image/video |
| `wan_animate` | Video | Wan animate images |
| `runway_aleph_video` | Video | Runway Aleph |
| `infinitalk_lip_sync` | Video | InfiniTalk lip sync |
| `suno_generate_music` | Audio | Suno AI music |
| `elevenlabs_tts` | Audio | ElevenLabs TTS |
| `elevenlabs_ttsfx` | Audio | ElevenLabs sound FX |
| `get_task_status` | Utility | Check task progress |
| `get_credit_balance` | Utility | Check credit balance |

## Rate Limits

- 20 requests per 10 seconds per account
- Supports 100+ concurrent tasks

## License

MIT
