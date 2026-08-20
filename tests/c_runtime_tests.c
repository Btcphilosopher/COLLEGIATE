/**
 * COLLEGIATE C Client Runtime Test Suite
 */

#include <stdio.h>
#include <assert.h>
#include <string.h>
#include <stdint.h>

extern uint32_t collegiate_compress_stream(const uint8_t* src, uint32_t src_len, uint8_t* dst, uint32_t dst_cap);
extern uint32_t collegiate_decompress_stream(const uint8_t* src, uint32_t src_len, uint8_t* dst, uint32_t dst_cap);

int main() {
    printf("Running COLLEGIATE C Runtime Tests...\n");

    const char* sample = "AAAAABBBCCCCCDDDDDDEEEEEEE";
    uint32_t len = (uint32_t)strlen(sample);
    uint8_t compressed[128];
    uint8_t decompressed[128];

    uint32_t comp_sz = collegiate_compress_stream((const uint8_t*)sample, len, compressed, sizeof(compressed));
    assert(comp_sz > 0 && comp_sz < len);

    uint32_t decomp_sz = collegiate_decompress_stream(compressed, comp_sz, decompressed, sizeof(decompressed));
    assert(decomp_sz == len);
    assert(memcmp(sample, decompressed, len) == 0);

    printf("Compression/Decompression tests PASSED (%u bytes -> %u bytes)\n", len, comp_sz);
    return 0;
}
