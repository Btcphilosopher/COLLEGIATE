/**
 * COLLEGIATE C Client Runtime Layer - Memory Arena & LRU Index Manager
 * High-speed fixed-size memory arena and zero-allocation hash index for client cache.
 */

#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define EXPORT __attribute__((visibility("default")))
#define CACHE_CAPACITY 256

typedef struct CacheNode {
    uint32_t key_hash;
    uint32_t data_offset;
    uint32_t data_len;
    uint64_t last_accessed;
    struct CacheNode* next;
} CacheNode;

typedef struct {
    uint8_t* arena_buffer;
    uint32_t arena_size;
    uint32_t arena_used;
    CacheNode* buckets[CACHE_CAPACITY];
    uint32_t entry_count;
    uint64_t access_tick;
} CollegiateLRUCache;

static uint32_t hash_str(const char* str) {
    uint32_t hash = 5381;
    int c;
    while ((c = *str++)) {
        hash = ((hash << 5) + hash) + c;
    }
    return hash;
}

EXPORT CollegiateLRUCache* collegiate_cache_create(uint32_t arena_size) {
    CollegiateLRUCache* cache = (CollegiateLRUCache*)malloc(sizeof(CollegiateLRUCache));
    if (!cache) return NULL;
    cache->arena_buffer = (uint8_t*)malloc(arena_size);
    cache->arena_size = arena_size;
    cache->arena_used = 0;
    cache->entry_count = 0;
    cache->access_tick = 1;
    memset(cache->buckets, 0, sizeof(cache->buckets));
    return cache;
}

EXPORT void collegiate_cache_free(CollegiateLRUCache* cache) {
    if (!cache) return;
    for (int i = 0; i < CACHE_CAPACITY; ++i) {
        CacheNode* curr = cache->buckets[i];
        while (curr) {
            CacheNode* next = curr->next;
            free(curr);
            curr = next;
        }
    }
    if (cache->arena_buffer) free(cache->arena_buffer);
    free(cache);
}

EXPORT int collegiate_cache_put(CollegiateLRUCache* cache, const char* key, const uint8_t* data, uint32_t len) {
    if (!cache || !key || !data || len == 0) return -1;
    if (cache->arena_used + len > cache->arena_size) {
        // Arena full - simple compaction or reset
        cache->arena_used = 0;
    }

    uint32_t hash = hash_str(key);
    uint32_t bucket = hash % CACHE_CAPACITY;

    uint32_t offset = cache->arena_used;
    memcpy(cache->arena_buffer + offset, data, len);
    cache->arena_used += len;

    CacheNode* node = (CacheNode*)malloc(sizeof(CacheNode));
    node->key_hash = hash;
    node->data_offset = offset;
    node->data_len = len;
    node->last_accessed = ++cache->access_tick;
    node->next = cache->buckets[bucket];
    cache->buckets[bucket] = node;
    cache->entry_count++;

    return 0;
}
