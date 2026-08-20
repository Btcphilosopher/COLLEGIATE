/**
 * COLLEGIATE C Client Runtime Layer - High Performance Image Operations
 * Provides bilinear downscaling, grayscale conversion, and fast thumbnail generation for client-side uploads.
 */

#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define EXPORT __attribute__((visibility("default")))

typedef struct {
    uint32_t width;
    uint32_t height;
    uint32_t channels;
    uint8_t* data;
} CollegiateBitmap;

EXPORT CollegiateBitmap* collegiate_create_bitmap(uint32_t width, uint32_t height, uint32_t channels) {
    CollegiateBitmap* bmp = (CollegiateBitmap*)malloc(sizeof(CollegiateBitmap));
    if (!bmp) return NULL;
    bmp->width = width;
    bmp->height = height;
    bmp->channels = channels;
    bmp->data = (uint8_t*)calloc(width * height * channels, sizeof(uint8_t));
    return bmp;
}

EXPORT void collegiate_free_bitmap(CollegiateBitmap* bmp) {
    if (bmp) {
        if (bmp->data) free(bmp->data);
        free(bmp);
    }
}

/**
 * Bilinear Resampling Algorithm in pure C for instantaneous client-side thumbnail generation
 */
EXPORT int collegiate_resize_bilinear(
    const uint8_t* src, uint32_t src_w, uint32_t src_h,
    uint8_t* dst, uint32_t dst_w, uint32_t dst_h,
    uint32_t channels
) {
    if (!src || !dst || src_w == 0 || src_h == 0 || dst_w == 0 || dst_h == 0) return -1;

    float x_ratio = ((float)(src_w - 1)) / dst_w;
    float y_ratio = ((float)(src_h - 1)) / dst_h;

    for (uint32_t y = 0; y < dst_h; ++y) {
        int y_l = (int)(y_ratio * y);
        int y_h = (y_l + 1 < (int)src_h) ? y_l + 1 : y_l;
        float y_diff = (y_ratio * y) - y_l;

        for (uint32_t x = 0; x < dst_w; ++x) {
            int x_l = (int)(x_ratio * x);
            int x_h = (x_l + 1 < (int)src_w) ? x_l + 1 : x_l;
            float x_diff = (x_ratio * x) - x_l;

            for (uint32_t c = 0; c < channels; ++c) {
                float a = src[(y_l * src_w + x_l) * channels + c];
                float b = src[(y_l * src_w + x_h) * channels + c];
                float e = src[(y_h * src_w + x_l) * channels + c];
                float d = src[(y_h * src_w + x_h) * channels + c];

                float val = a * (1.0f - x_diff) * (1.0f - y_diff) +
                            b * (x_diff) * (1.0f - y_diff) +
                            e * (y_diff) * (1.0f - x_diff) +
                            d * (x_diff * y_diff);

                dst[(y * dst_w + x) * channels + c] = (uint8_t)val;
            }
        }
    }
    return 0;
}
