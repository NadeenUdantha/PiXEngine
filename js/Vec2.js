


class Vec2 {
    constructor(x, y) {
        this.x = x ? x : 0, this.y = y ? y : 0
    }
    set(x, y) {
        if (!isNaN(x) && !isNaN(y))
            this.x = x, this.y = y
        return this
    }
    setX(x) {
        if (!isNaN(x))
            this.x = x
        return this
    }
    setY(y) {
        if (!isNaN(y))
            this.y = y
        return this
    }
    mulAdd(v, m) {
        if (!isNaN(m) && !v.isNaN()) {
            this.x += v.x * m
            this.y += v.y * m
        }
        return this
    }
    add(v, w) {
        if (w === undefined) {
            if (!v.isNaN())
                this.x += v.x, this.y += v.y
        }
        else
            if (!isNaN(v) && !isNaN(w))
                this.x += v, this.y += w
        return this
    }
    angle() {
        return atan2(this.y, this.x)
    }
    sub2(v) {
        return new Vec2(this.x - v.x, this.y - v.y)
    }
    dot(v) {
        return this.x * v.x + this.y * v.y
    }
    distance(v) {
        return sqrt(pow2(this.x - (v ? v.x : 0)) + pow2(this.y - (v ? v.y : 0)))
    }
    distancexy(x, y) {
        return sqrt(pow2(this.x - x) + pow2(this.y - y))
    }
    copy() {
        return new Vec2(this.x, this.y)
    }
    isZero() {
        return this.x === 0 && this.y === 0
    }
    isNaN() {
        return isNaN(this.x) || isNaN(this.y)
    }
    str(d) {
        return `x: ${i2str(this.x, d)} y: ${i2str(this.y, d)}`
    }
}