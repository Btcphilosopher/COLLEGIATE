/**
 * COLLEGIATE C Client Runtime Layer - High-Throughput Byte Compression
 * Fast LZ/RLE byte-stream packer for client cache storage and network frame serialization.
 */

#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define EXPORT __attribute__((visibility("default")))

/**
 * Fast Byte-Run Compression for JSON payloads and bitmap matrices
 */
EXPORT uint32_t collegiate_compress_stream(const uint8_t* src, uint32_t src_len, uint8_t* dst, uint32_t dst_cap) {
    if (!src || !dst || src_len == 0 || dst_cap == 0) return 0;

    uint32_t src_idx = 0;
    uint32_t dst_idx = 0;

    while (src_idx < src_len && dst_idx + 3 <= dst_cap) {
        uint8_t current_byte = src[src_idx];
        uint32_t run_len = 1;

        while (src_idx + run_len < src_len && src[src_idx + run_len] == current_byte && run_len < 255) {
            run_len++;
        }

        if (run_len >= 3) {
            // Encode run
            dst[dst_idx++] = 0xFF; // Run marker
            dst[dst_idx++] = (uint8_t)run_len;
            dst[dst_idx++] = current_byte;
            src_idx += run_len;
        } else {
            // Literal byte
            if (current_byte == 0xFF) {
                if (dst_idx + 2 > dst_cap) break;
                dst[dst_idx++] = 0xFF;
                dst[dst_idx++] = 0x00; // Escaped marker
            } else {
                dst[dst_idx++] = current_byte;
            }
            src_idx++;
        }
    }

    return dst_idx;
}

EXPORT uint32_t collegiate_decompress_stream(const uint8_t* src, uint32_t src_len, uint8_t* dst, uint32_t dst_cap) {
    if (!src || !dst || src_len == 0 || dst_cap == 0) return 0;

    uint32_t src_idx = 0;
    uint32_t dst_idx = 0;

    while (src_idx < src_len && dst_idx < dst_cap) {
        uint8_t byte = src[src_idx++];
        if (byte == 0xFF) {
            if (src_idx >= src_len) break;
            uint8_t count = src[src_idx++];
            if (count == 0x00) {
                dst[dst_idx++] = 0xFF;
            } else {
                if (src_idx >= src_len) break;
                uint8_t val = src[src_idx++];
                for (uint32_t i = 0; i < count && dst_idx < dst_cap; ++i) {
                    dst[dst_idx++] = val;
                }
            }
        } else {
            dst[dst_idx++] = byte;
        }
    }

    return dst_idx;
}
