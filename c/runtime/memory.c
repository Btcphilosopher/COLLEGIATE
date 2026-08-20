/**
 * COLLEGIATE C Client Runtime Layer - Memory Arena & Hardware Inspection
 */

#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define EXPORT __attribute__((visibility("default")))

typedef struct {
    uint8_t* memory;
    size_t capacity;
    size_t offset;
} CollegiateArena;

EXPORT CollegiateArena* collegiate_arena_init(size_t capacity) {
    CollegiateArena* arena = (CollegiateArena*)malloc(sizeof(CollegiateArena));
    if (!arena) return NULL;
    arena->memory = (uint8_t*)malloc(capacity);
    arena->capacity = capacity;
    arena->offset = 0;
    return arena;
}

EXPORT void* collegiate_arena_alloc(CollegiateArena* arena, size_t size) {
    if (!arena || arena->offset + size > arena->capacity) return NULL;
    void* ptr = &arena->memory[arena->offset];
    arena->offset += (size + 7) & ~7; // 8-byte alignment
    return ptr;
}

EXPORT void collegiate_arena_reset(CollegiateArena* arena) {
    if (arena) arena->offset = 0;
}

EXPORT void collegiate_arena_destroy(CollegiateArena* arena) {
    if (arena) {
        if (arena->memory) free(arena->memory);
        free(arena);
    }
}
