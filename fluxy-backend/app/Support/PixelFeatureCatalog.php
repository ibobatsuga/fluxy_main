<?php

namespace App\Support;

use Illuminate\Support\Str;

final class PixelFeatureCatalog
{
    private const DEFAULTS = [
        'multi_image' => false,
        'requires_image' => true,
        'requires_prompt' => false,
        'text_output' => false,
    ];

    /**
     * @return array<string, array{name:string,category:string,description:string,multi_image:bool,requires_image:bool,requires_prompt:bool,text_output:bool,prompt_template:string}>
     */
    public static function features(): array
    {
        $raw = [
            'image-to-prompt' => [
                'name' => 'Gambar ke Prompt',
                'category' => 'Vision AI',
                'description' => 'Ubah gambar menjadi prompt AI detail.',
                'requires_prompt' => false,
                'text_output' => true,
                'prompt_template' => 'Analyze this image in detail and generate a comprehensive AI image generation prompt in English that would recreate it. Also provide a short description.',
            ],
            'remove-bg' => [
                'name' => 'Hapus Background',
                'category' => 'Edit Cepat',
                'description' => 'Menghapus background foto secara otomatis.',
                'prompt_template' => 'Remove the background from this image completely. Make the background fully transparent or plain white. Keep the subject sharp and intact.',
            ],
            'retouch' => [
                'name' => 'AI Retouch',
                'category' => 'Edit Cepat',
                'description' => 'Perbaikan kulit dan detail wajah.',
                'prompt_template' => 'Professionally retouch this portrait photo. Smooth skin blemishes, enhance facial features naturally, improve lighting and colors. Keep it realistic.',
            ],
            'photo-enhance' => [
                'name' => 'Perbaiki Foto',
                'category' => 'Edit Cepat',
                'description' => 'Restorasi foto lama dan buram.',
                'prompt_template' => 'Restore and enhance this photo. Fix blur, noise, low resolution, and fading. Make it sharp, clear, and vibrant.',
            ],
            'sketch' => [
                'name' => 'Sketsa AI',
                'category' => 'Creative',
                'description' => 'Konversi foto menjadi sketsa.',
                'prompt_template' => 'Convert this photo into a detailed pencil sketch art style. Keep fine details and shading.',
            ],
            'caricature' => [
                'name' => 'Art & Karikatur',
                'category' => 'Creative',
                'description' => 'Foto menjadi gaya artistik.',
                'prompt_template' => 'Transform this photo into a beautiful artistic illustration or caricature style. Keep recognizable features.',
            ],
            'anime-real' => [
                'name' => 'Anime To Real',
                'category' => 'Creative',
                'description' => 'Mengubah anime menjadi realistis.',
                'prompt_template' => "Convert this anime/cartoon image into a realistic photographic style while keeping the person's features.",
            ],
            'magic-edit' => [
                'name' => 'AI Edit',
                'category' => 'Edit Cepat',
                'description' => 'Edit foto berdasarkan instruksi.',
                'requires_prompt' => true,
                'prompt_template' => "Edit this image based on the user's instruction: {PROMPT}. Make the change natural and seamless.",
            ],
            'change-angle' => [
                'name' => 'Ubah Angle',
                'category' => 'Edit Cepat',
                'description' => 'Mengubah sudut kamera.',
                'requires_prompt' => true,
                'prompt_template' => 'Change the camera angle or perspective of this image as described: {PROMPT}. Keep the subject realistic.',
            ],
            'photo-merge' => [
                'name' => 'Gabung Foto',
                'category' => 'Professional',
                'description' => 'Gabungkan beberapa foto.',
                'multi_image' => true,
                'prompt_template' => 'Seamlessly merge these reference images into one cohesive composition: {PROMPT}.',
            ],
            'face-swap' => [
                'name' => 'Face Swap',
                'category' => 'Professional',
                'description' => 'Pertukaran wajah dengan referensi.',
                'multi_image' => true,
                'prompt_template' => 'Carefully swap the face from the reference image onto the target. Keep natural lighting, skin tone, and realistic blending.',
            ],
            'product-studio' => [
                'name' => 'Product Studio',
                'category' => 'Professional',
                'description' => 'Foto produk studio profesional.',
                'multi_image' => true,
                'prompt_template' => 'Create a professional commercial product photograph. Clean studio-quality background, perfect lighting: {PROMPT}. Clean, polished, high-detail result without watermarks or added text.',
            ],
            'fashion-ai' => [
                'name' => 'Fashion AI',
                'category' => 'Professional',
                'description' => 'Mockup fashion menggunakan AI.',
                'multi_image' => true,
                'prompt_template' => 'Create a professional fashion photo with the clothing item shown on a model: {PROMPT}.',
            ],
            'mockup' => [
                'name' => 'Product Mockup',
                'category' => 'Professional',
                'description' => 'Tempel desain ke mockup.',
                'multi_image' => true,
                'prompt_template' => 'Apply the design/logo onto the product mockup template naturally: {PROMPT}.',
            ],
            'virtual-tryon' => [
                'name' => 'Virtual Try On',
                'category' => 'Professional',
                'description' => 'Pasangkan pakaian virtual.',
                'multi_image' => true,
                'prompt_template' => 'Virtually try on the clothing item from the reference image onto the person: {PROMPT}.',
            ],
            'pose-change' => [
                'name' => 'Ubah Pose',
                'category' => 'Professional',
                'description' => 'Mengubah pose manusia.',
                'multi_image' => true,
                'requires_prompt' => true,
                'prompt_template' => "Change the person's pose as described: {PROMPT}. Keep the person's identity and clothing intact.",
            ],
            'passport' => [
                'name' => 'Pas Foto AI',
                'category' => 'Professional',
                'description' => 'Foto formal dokumen.',
                'prompt_template' => 'Create a professional passport/ID photo: white background, front-facing, formal attire, proper lighting.',
            ],
            'barber' => [
                'name' => 'Barber Preview',
                'category' => 'Professional',
                'description' => 'Simulasi gaya rambut.',
                'multi_image' => true,
                'prompt_template' => "Apply the hairstyle from the reference image onto the person's photo: {PROMPT}.",
            ],
            'outpaint' => [
                'name' => 'Perluas Foto',
                'category' => 'Professional',
                'description' => 'Memperluas area foto.',
                'prompt_template' => 'Extend and expand this image outward in all directions while maintaining the style and content naturally.',
            ],
            'prewedding' => [
                'name' => 'Pre Wedding AI',
                'category' => 'Special Moments',
                'description' => 'Foto prewedding AI.',
                'multi_image' => true,
                'prompt_template' => 'Create a beautiful pre-wedding themed photo with romantic setting: {PROMPT}.',
            ],
            'couple' => [
                'name' => 'Potret Cinta',
                'category' => 'Special Moments',
                'description' => 'Foto pasangan natural.',
                'multi_image' => true,
                'prompt_template' => 'Create a natural, romantic couple portrait photo: {PROMPT}.',
            ],
            'baby' => [
                'name' => 'Baby Born',
                'category' => 'Special Moments',
                'description' => 'Newborn studio AI.',
                'prompt_template' => 'Create a cute, safe newborn studio photo with soft lighting and gentle colors: {PROMPT}.',
            ],
            'child' => [
                'name' => 'Foto Anak',
                'category' => 'Special Moments',
                'description' => 'Tema foto anak.',
                'prompt_template' => 'Create a fun, natural child portrait photo with a suitable background: {PROMPT}.',
            ],
            'umroh' => [
                'name' => 'Umroh & Haji',
                'category' => 'Special Moments',
                'description' => 'Foto tema religi.',
                'prompt_template' => 'Create a beautiful photo with Islamic/spiritual theme, Mecca setting or Masjid background: {PROMPT}.',
            ],
            'maternity' => [
                'name' => 'Maternity',
                'category' => 'Special Moments',
                'description' => 'Foto maternity.',
                'prompt_template' => 'Create an artistic, beautiful maternity portrait photo with soft lighting: {PROMPT}.',
            ],
            'banner' => [
                'name' => 'Banner AI',
                'category' => 'Marketing',
                'description' => 'Banner promosi hybrid AI.',
                'multi_image' => true,
                'requires_image' => false,
                'requires_prompt' => true,
                'prompt_template' => 'Create a professional marketing banner image (no text). Vibrant colors, product-focused, clean design: {PROMPT}.',
            ],
            'carousel' => [
                'name' => 'Carousel Sosmed',
                'category' => 'Marketing',
                'description' => 'Carousel Instagram AI.',
                'multi_image' => true,
                'requires_image' => false,
                'requires_prompt' => true,
                'prompt_template' => 'Create a consistent set of social media carousel slide backgrounds. Clean, branded design: {PROMPT}.',
            ],
        ];

        $features = [];
        foreach ($raw as $id => $definition) {
            $features[$id] = [...self::DEFAULTS, ...$definition];
        }

        return $features;
    }

    /**
     * @return array{name:string,category:string,description:string,multi_image:bool,requires_image:bool,requires_prompt:bool,text_output:bool,prompt_template:string}|null
     */
    public static function get(string $id): ?array
    {
        return self::features()[$id] ?? null;
    }

    /** @return list<string> */
    public static function ids(): array
    {
        return array_keys(self::features());
    }

    public static function buildPrompt(string $id, string $instruction): string
    {
        $feature = self::get($id);
        $template = $feature['prompt_template'] ?? 'Generate a high quality image based on the user prompt: {PROMPT}';

        $text = str_contains($template, '{PROMPT}')
            ? str_replace('{PROMPT}', $instruction !== '' ? $instruction : 'Follow the tool description precisely.', $template)
            : $template;

        return Str::limit($text, 2048, '');
    }
}
