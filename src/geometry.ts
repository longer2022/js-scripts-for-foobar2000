/**
 * package net.ivank.geom;
 * orign by Ivan Kuclir
 */

/**
 * A class for representing a 2D point
 */

/**
 * @constructor
 */
class Point {
	x: number;
	y: number;

	constructor(x: number = 0, y: number = 0) {
		if (!x) x = 0;
		if (!y) y = 0;
		this.x = x;
		this.y = y;
	}

	add(p: Point) {
		return new Point(this.x + p.x, this.y + p.y);
	}

	clone() {
		return new Point(this.x, this.y);
	}

	copyFrom(p: Point) {
		this.x = p.x;
		this.y = p.y;
	}

	equals(p: Point) {
		return this.x == p.x && this.y == p.y;
	}

	normalize(len: number) {
		var l = Math.sqrt(this.x * this.x + this.y * this.y);
		this.x *= len / l;
		this.y *= len / l;
	}

	offset(x: number, y: number) {
		this.x += x;
		this.y += y;
	}

	setTo(xa: number, ya: number) {
		this.x = xa;
		this.y = ya;
	}

	subtract(p: Point) {
		return new Point(this.x - p.x, this.y - p.y);
	}

	static distance(a, b) {
		return Point._distance(a.x, a.y, b.x, b.y);
	}
	static interpolate(a, b, f) {
		return new Point(a.x + f * (b.x - a.x), a.y + f * (b.y - a.y));
	}
	static polar(len, ang) {
		return new Point(len * Math.cos(ang), len * Math.sin(ang));
	}
	static _distance(x1, y1, x2, y2) {
		return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	}

	static _v4: any = {};
	static _m4: any = {};
}

Point._v4.create = function () {
	var out = new Float32Array(4);
	return out;
};

Point._m4.create = function (mat) {
	var d = new Float32Array(16);
	d[0] = d[5] = d[10] = d[15] = 1.0;
	if (mat) Point._m4.set(mat, d);
	return d;
};

Point._v4.add = function (a, b, out) {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	out[3] = a[3] + b[3];
};

Point._v4.set = function (a, out) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
};

Point._m4.set = function (m, d) {
	d[0] = m[0];
	d[1] = m[1];
	d[2] = m[2];
	d[3] = m[3];
	d[4] = m[4];
	d[5] = m[5];
	d[6] = m[6];
	d[7] = m[7];
	d[8] = m[8];
	d[9] = m[9];
	d[10] = m[10];
	d[11] = m[11];
	d[12] = m[12];
	d[13] = m[13];
	d[14] = m[14];
	d[15] = m[15];
};

Point._m4.multiply = function (a, b, out) {
	var a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a03 = a[3],
		a10 = a[4],
		a11 = a[5],
		a12 = a[6],
		a13 = a[7],
		a20 = a[8],
		a21 = a[9],
		a22 = a[10],
		a23 = a[11],
		a30 = a[12],
		a31 = a[13],
		a32 = a[14],
		a33 = a[15];

	// Cache only the current line of the second matrix
	var b0 = b[0],
		b1 = b[1],
		b2 = b[2],
		b3 = b[3];
	out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[4];
	b1 = b[5];
	b2 = b[6];
	b3 = b[7];
	out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[8];
	b1 = b[9];
	b2 = b[10];
	b3 = b[11];
	out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[12];
	b1 = b[13];
	b2 = b[14];
	b3 = b[15];
	out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	return out;
};

Point._m4.inverse = function (a, out) {
	var a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a03 = a[3],
		a10 = a[4],
		a11 = a[5],
		a12 = a[6],
		a13 = a[7],
		a20 = a[8],
		a21 = a[9],
		a22 = a[10],
		a23 = a[11],
		a30 = a[12],
		a31 = a[13],
		a32 = a[14],
		a33 = a[15],
		b00 = a00 * a11 - a01 * a10,
		b01 = a00 * a12 - a02 * a10,
		b02 = a00 * a13 - a03 * a10,
		b03 = a01 * a12 - a02 * a11,
		b04 = a01 * a13 - a03 * a11,
		b05 = a02 * a13 - a03 * a12,
		b06 = a20 * a31 - a21 * a30,
		b07 = a20 * a32 - a22 * a30,
		b08 = a20 * a33 - a23 * a30,
		b09 = a21 * a32 - a22 * a31,
		b10 = a21 * a33 - a23 * a31,
		b11 = a22 * a33 - a23 * a32,
		// Calculate the determinant
		det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	if (!det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

	return out;
};

Point._m4.multiplyVec2 = function (m, vec, dest) {
	var x = vec[0],
		y = vec[1];
	dest[0] = x * m[0] + y * m[4] + m[12];
	dest[1] = x * m[1] + y * m[5] + m[13];
};

Point._m4.multiplyVec4 = function (m, v, out) {
	var v0 = v[0],
		v1 = v[1],
		v2 = v[2],
		v3 = v[3];

	out[0] = m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12] * v3;
	out[1] = m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13] * v3;
	out[2] = m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14] * v3;
	out[3] = m[3] * v0 + m[7] * v1 + m[11] * v2 + m[15] * v3;
};
//package net.ivank.geom;

/**
 * A basic class for representing an axis-aligned rectangle
 * @author Ivan Kuckir
 *
 */

class Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;

	/**
	 * @constructor
	 */
	constructor(x = 0, y = 0, w = 0, h = 0) {
		if (!x) x = 0;
		if (!y) y = 0;
		if (!w) w = 0;
		if (!h) h = 0;
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}

	clone() {
		return new Rectangle(this.x, this.y, this.width, this.height);
	}

	contains(x: number, y: number) {
		return (
			x >= this.x &&
			x <= this.x + this.width &&
			y >= this.y &&
			y <= this.y + this.height
		);
	}

	containsPoint(p: Point) {
		return this.contains(p.x, p.y);
	}
	containsRect(r: Rectangle) {
		return (
			this.x <= r.x &&
			this.y <= r.y &&
			r.x + r.width <= this.x + this.width &&
			r.y + r.height <= this.y + this.height
		);
	}
	copyFrom(r: Rectangle) {
		this.x = r.x;
		this.y = r.y;
		this.width = r.width;
		this.height = r.height;
	}

	equals(r: Rectangle) {
		return (
			this.x == r.x &&
			this.y == r.y &&
			this.width == r.width &&
			this.height == r.height
		);
	}

	inflate(dx: number, dy: number) {
		this.x -= dx;
		this.y -= dy;
		this.width += 2 * dx;
		this.height += 2 * dy;
	}

	inflatePoint(p: Point) {
		this.inflate(p.x, p.y);
	}

	intersection(rec: Rectangle) {
		var l = Math.max(this.x, rec.x);
		var u = Math.max(this.y, rec.y);
		var r = Math.min(this.x + this.width, rec.x + rec.width);
		var d = Math.min(this.y + this.height, rec.y + rec.height);
		if (r < l || d < u) return new Rectangle();
		else return new Rectangle(l, u, r - l, d - u);
	}

	intersects(r: Rectangle) {
		if (
			r.y + r.height < this.y ||
			r.x > this.x + this.width ||
			r.y > this.y + this.height ||
			r.x + r.width < this.x
		)
			return false;
		return true;
	}

	isEmpty() {
		return this.width <= 0 || this.height <= 0;
	}

	offset(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
	}

	offsetPoint(p: Point) {
		this.offset(p.x, p.y);
	}

	setEmpty() {
		this.x = this.y = this.width = this.height = 0;
	}

	setTo(x: number, y: number, w: number, h: number) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}

	union(r: Rectangle) {
		// : Rectangle
		if (this.isEmpty()) return r.clone();
		if (r.isEmpty()) return this.clone();
		var nr = this.clone();
		nr._unionWith(r);
		return nr;
	}

	static _temp = new Float32Array(2);

	_unionWith(r: Rectangle) {
		// : void
		if (r.isEmpty()) return;
		if (this.isEmpty()) {
			this.copyFrom(r);
			return;
		}
		this._unionWP(r.x, r.y);
		this._unionWP(r.x + r.width, r.y + r.height);
	}

	_unionWP(x: number, y: number) {
		// union with point
		var minx = Math.min(this.x, x);
		var miny = Math.min(this.y, y);
		this.width = Math.max(this.x + this.width, x) - minx;
		this.height = Math.max(this.y + this.height, y) - miny;
		this.x = minx;
		this.y = miny;
	}

	_unionWL = function (x0: number, y0: number, x1: number, y1: number) {
		// union with point
		if (this.width == 0 && this.height == 0) this._setP(x0, y0);
		else this._unionWP(x0, y0);
		this._unionWP(x1, y1);
	};

	_setP(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.width = this.height = 0;
	} //package net.ivank.geom;
}

/**
 * A class for representing a 2D point
 * @author Ivan Kuckir
 */
class Transform {
	_obj = null;

	_mdirty = false; // matrix dirty
	_vdirty = false; // values dirty

	_tmat = Point._m4.create();
	_imat = Point._m4.create();
	_atmat = Point._m4.create();
	_aimat = Point._m4.create();
	_pscal = Point._m4.create();

	_cmat = Point._m4.create();
	_cvec = Point._v4.create();
	_cID = true;

	_scaleX = 1;
	_scaleY = 1;
	_scaleZ = 1;
	_rotationX = 0;
	_rotationY = 0;
	_rotationZ = 0;

	_getTMat() {
		var o = this._obj;
		var m = this._tmat;
		this._checkMat();
		m[12] = o.x;
		m[13] = o.y;
		m[14] = o.z;
		return m;
	}

	_getIMat() {
		Point._m4.inverse(this._getTMat(), this._imat);
		return this._imat;
	}

	_postScale(sx, sy) {
		this._checkMat();
		var ps = this._pscal;
		ps[10] = ps[15] = 1;
		ps[0] = sx;
		ps[5] = sy;
		Point._m4.multiply(ps, this._tmat, this._tmat);
		this._vdirty = true;
	}

	_valsToMat() {
		var m = this._tmat;

		var sx = this._scaleX;
		var sy = this._scaleY;
		var sz = this._scaleZ;

		var r = -0.01745329252;
		var a = this._rotationX * r; // alpha
		var b = this._rotationY * r; // beta
		var g = this._rotationZ * r; // gama

		var ca = Math.cos(a),
			cb = Math.cos(b),
			cg = Math.cos(g);
		var sa = Math.sin(a),
			sb = Math.sin(b),
			sg = Math.sin(g);

		m[0] = cb * cg * sx;
		m[1] = -cb * sg * sx;
		m[2] = sb * sx;
		m[4] = (ca * sg + sa * sb * cg) * sy;
		m[5] = (ca * cg - sa * sb * sg) * sy;
		m[6] = -sa * cb * sy;
		m[8] = (sa * sg - ca * sb * cg) * sz;
		m[9] = (sa * cg + ca * sb * sg) * sz;
		m[10] = ca * cb * sz;
	}

	_matToVals() {
		var a = this._tmat;

		var a00 = a[0],
			a01 = a[1],
			a02 = a[2],
			a10 = a[4],
			a11 = a[5],
			a12 = a[6],
			a20 = a[8],
			a21 = a[9],
			a22 = a[10];

		this._scaleX = Math.sqrt(a00 * a00 + a01 * a01 + a02 * a02);
		this._scaleY = Math.sqrt(a10 * a10 + a11 * a11 + a12 * a12);
		this._scaleZ = Math.sqrt(a20 * a20 + a21 * a21 + a22 * a22);
		var isX = 1 / this._scaleX,
			isY = 1 / this._scaleY,
			isZ = 1 / this._scaleZ;

		a00 *= isX;
		a01 *= isX;
		a02 *= isX;
		a10 *= isY;
		a11 *= isY;
		a12 *= isY;
		a20 *= isZ;
		a21 *= isZ;
		a22 *= isZ;

		var r = -57.29577951308;
		this._rotationX = r * Math.atan2(-a12, a22);
		this._rotationY = r * Math.atan2(a02, Math.sqrt(a12 * a12 + a22 * a22));
		this._rotationZ = r * Math.atan2(-a01, a00);
	}

	_checkVals() {
		if (this._vdirty) {
			this._matToVals();
			this._vdirty = false;
		}
	}
	_checkMat = function () {
		if (this._mdirty) {
			this._valsToMat();
			this._mdirty = false;
		}
	};

	_setOPos(m) {
		var m = this._tmat;
		this._obj.x = m[12];
		this._obj.y = m[13];
		this._obj.z = m[14];
	}

	_checkColorID() {
		var m = this._cmat;
		var v = this._cvec;
		this._cID =
			m[15] == 1 &&
			m[0] == 1 &&
			m[1] == 0 &&
			m[2] == 0 &&
			m[3] == 0 &&
			m[4] == 0 &&
			m[5] == 1 &&
			m[6] == 0 &&
			m[7] == 0 &&
			m[8] == 0 &&
			m[9] == 0 &&
			m[10] == 1 &&
			m[11] == 0 &&
			m[12] == 0 &&
			m[13] == 0 &&
			m[14] == 0 &&
			m[15] == 1 &&
			v[0] == 0 &&
			v[1] == 0 &&
			v[2] == 0 &&
			v[3] == 0;
	}

	_setMat3(m3) {
		var m4 = this._tmat;
		m4[0] = m3[0];
		m4[1] = m3[1];
		m4[4] = m3[3];
		m4[5] = m3[4];
		m4[12] = m3[6];
		m4[13] = m3[7];
	}
	_getMat3(m3) {
		var m4 = this._tmat;
		m3[0] = m4[0];
		m3[1] = m4[1];
		m3[3] = m4[4];
		m3[4] = m4[5];
		m3[6] = m4[12];
		m3[7] = m4[13];
	}

	_setCMat5(m5) {
		var m4 = this._cmat,
			v4 = this._cvec;
		for (var i = 0; i < 4; i++) {
			v4[i] = m5[20 + i];
			for (var j = 0; j < 4; j++) m4[4 * i + j] = m5[5 * i + j];
		}
	}
	_getCMat5(m5) {
		var m4 = this._cmat,
			v4 = this._cvec;
		m5[24] = 1;
		for (var i = 0; i < 4; i++) {
			m5[20 + i] = v4[i];
			for (var j = 0; j < 4; j++) m5[5 * i + j] = m4[4 * i + j];
		}
	}

	set matrix(m) {
		this._checkMat();
		this._setMat3(m);
		this._setOPos();
		this._vdirty = true;
	}
	get matrix() {
		this._checkMat();
		var m = new Float32Array(9);
		this._getMat3(m);
		return m;
	}

	set matrix3D(m) {
		this._checkMat();
		Point._m4.set(m, this._tmat);
		this._setOPos();
		this._vdirty = true;
	}
	get matrix3D() {
		this._checkMat();
		return Point._m4.create(this._getTMat());
	}

	set colorTransform(m) {
		this._setCMat5(m);
		this._checkColorID();
	}
	get colorTransform() {
		var m = new Float32Array(25);
		this._getCMat5(m);
		return m;
	}
}
