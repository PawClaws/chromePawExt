 describe('Array', function() {
        it('isArray should polyfill', function() {
            expect(Array.isArray).toBeDefined();
            expect(Array.isArray([])).toBe(true);
            expect(Array.isArray('nope')).toBe(false);
            expect(Array.isArray(9)).toBe(false);
            expect(Array.isArray(true)).toBe(false);
            expect(Array.isArray({})).toBe(false);

        });
    });

