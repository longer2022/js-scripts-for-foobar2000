import { EventDispatcher, FbEvent } from "src/event";

const BlendMode = {
	NORMAL: 'normal',
	ADD: 'add',
	SUBTRACT: 'subtract',
	MULTIPLY: 'multiply',
	SCREEN: 'screen',

	ERASE: 'erase',
	ALPHA: 'alpha',
};

/**
 * A basic class in the Display API
 *
 * @author origin: Ivan Kuckir
 */



export class DisplayObject  extends EventDispatcher {

visible = true;
parent: DisplayObject = null;
stage : DisplayObject= null;
blendMode = BlendMode.NORMAL;

	//*
	//	for fast access
x = 0;
y = 0;
z = 0;
	transform: any;
	private _trect: any;
	private _tempP: any;
	private _torg: any;
	private _tvec4_0: any;
	private _atsEv: FbEvent;
	private _rfsEv: FbEvent;
	//*/

	constructor () {
		super();
this.transform = new Transform();
		this.transform._obj = this;

	this._trect = new Rectangle(); // temporary rectangle

	this._tempP = new Point();
	this._torg = Point._v4.create();
	this._tvec4_0 = Point._v4.create();
	this._tvec4_0 = Point._v4.create();

	this._tempP = Point._m4.create();

	this._atsEv = new FbEvent(FbEvent.ADDED_TO_STAGE);
	this._rfsEv = new FbEvent(FbEvent.REMOVED_FROM_STAGE);
	this._atsEv.target = this._rfsEv.target = this;

	}


dispatchEvent  (e: FbEvent	) {
	// : returns the deepest active InteractiveObject of subtree
	EventDispatcher.prototype.dispatchEvent.call(this, e);
	if (e.bubbles && this.parent != null) this.parent.dispatchEvent(e);
}

_globalToLocal (sp, tp) {
	// OK
	var org = this._torg;
	Stage._main._getOrigin(org);
	Point._m4.multiplyVec4(this._getAIMat(), org, org);

	var p1 = this._tvec4_1;
	p1[0] = sp.x;
	p1[1] = sp.y;
	p1[2] = 0;
	p1[3] = 1;
	Point._m4.multiplyVec4(this._getAIMat(), p1, p1);

	this._lineIsc(org, p1, tp);
};

globalToLocal  (p) {
	// OK
	var lp = new Point();
	this._globalToLocal(p, lp);
	return lp;
};

localToGlobal (p) {
	// OK
	var org = this._torg;
	Stage._main._getOrigin(org);

	var p1 = this._tvec4_1;
	p1[0] = p.x;
	p1[1] = p.y;
	p1[2] = 0;
	p1[3] = 1;
	Point._m4.multiplyVec4(this._getATMat(), p1, p1);

	var lp = new Point();
	this._lineIsc(org, p1, lp);
	return lp;
};

// Intersection between line p0, p1 and plane z=0  (result has z==0)

_lineIsc (p0, p1, tp) {
	var dx = p1[0] - p0[0],
		dy = p1[1] - p0[1],
		dz = p1[2] - p0[2];

	var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
	dx /= len;
	dy /= len;
	dz /= len;

	var d = -p0[2] / dz;
	tp.x = p0[0] + d * dx;
	tp.y = p0[1] + d * dy;
};

_transfRect (mat, torg, srct, trct) {
	var sp = this._tvec4_0;
	var tp = this._tvec4_1;
	var p = new Point();
	var minx = Infinity,
		miny = Infinity,
		maxx = -Infinity,
		maxy = -Infinity;

	sp[0] = srct.x;
	sp[1] = srct.y;
	sp[2] = 0;
	sp[3] = 1;
	Point._m4.multiplyVec4(mat, sp, tp);
	this._lineIsc(torg, tp, p);
	minx = Math.min(minx, p.x);
	miny = Math.min(miny, p.y);
	maxx = Math.max(maxx, p.x);
	maxy = Math.max(maxy, p.y);

	sp[0] = srct.x + srct.width;
	sp[1] = srct.y;
	sp[2] = 0;
	sp[3] = 1;
	Point._m4.multiplyVec4(mat, sp, tp);
	this._lineIsc(torg, tp, p);
	minx = Math.min(minx, p.x);
	miny = Math.min(miny, p.y);
	maxx = Math.max(maxx, p.x);
	maxy = Math.max(maxy, p.y);

	sp[0] = srct.x;
	sp[1] = srct.y + srct.height;
	sp[2] = 0;
	sp[3] = 1;
	Point._m4.multiplyVec4(mat, sp, tp);
	this._lineIsc(torg, tp, p);
	minx = Math.min(minx, p.x);
	miny = Math.min(miny, p.y);
	maxx = Math.max(maxx, p.x);
	maxy = Math.max(maxy, p.y);

	sp[0] = srct.x + srct.width;
	sp[1] = srct.y + srct.height;
	sp[2] = 0;
	sp[3] = 1;
	Point._m4.multiplyVec4(mat, sp, tp);
	this._lineIsc(torg, tp, p);
	minx = Math.min(minx, p.x);
	miny = Math.min(miny, p.y);
	maxx = Math.max(maxx, p.x);
	maxy = Math.max(maxy, p.y);

	trct.x = minx;
	trct.y = miny;
	trct.width = maxx - minx;
	trct.height = maxy - miny;
};

_getLocRect  () {};

//  Returns bounding rectangle
// 		tmat : matrix from global to target local
// 		torg : origin in tmat coordinates
//		result: read-only

_getRect  (tmat, torg, stks) {
	Point._m4.multiply(tmat, this._getATMat(), this._tempm);
	this._transfRect(this._tempm, torg, this._getLocRect(), this._trect);
	return this._trect;
};

_getR  (tcs, stks) {
	Stage._main._getOrigin(this._torg);
	Point._m4.multiplyVec4(tcs._getAIMat(), this._torg, this._torg);
	return this._getRect(tcs._getAIMat(), this._torg, stks);
};

_getParR  (tcs, stks) {
	if (DisplayObject._tdo == null) DisplayObject._tdo = new DisplayObject();
	var nopar = this.parent == null;
	if (nopar) this.parent = DisplayObject._tdo;
	var out = this._getR(this.parent, stks);
	if (nopar) this.parent = null;
	return out;
};

// no strokes
getRect  (tcs) {
	return this._getR(tcs, false).clone();
};
// with strokes
getBounds  (tcs) {
	return this._getR(tcs, true).clone();
};

//  Check, whether object hits a line org, p in local coordinate system

_htpLocal  (org, p) {
	var tp = this._tempP;
	this._lineIsc(org, p, tp);
	return this._getLocRect().contains(tp.x, tp.y);
};

//  tests, if object intersects a point in Stage coordinates

hitTestPoint  (x, y, shapeFlag) {
	if (shapeFlag == null) shapeFlag = false;

	var org = this._torg;
	Stage._main._getOrigin(org);
	Point._m4.multiplyVec4(this._getAIMat(), org, org);

	var p1 = this._tvec4_1;
	p1[0] = x;
	p1[1] = y;
	p1[2] = 0;
	p1[3] = 1;
	Point._m4.multiplyVec4(this._getAIMat(), p1, p1);

	//  org and p1 are in local coordinates
	//  now we have to decide, if line (p0, p1) intersects an object

	if (shapeFlag) return this._htpLocal(org, p1);
	else return this._getR(Stage._main, false).contains(x, y);
};

hitTestObject  (obj) {
	var r0 = this._getR(Stage._main, false);
	var r1 = obj._getR(Stage._main, false);
	return r0.intersects(r1);
};

_loseFocus  () {};

/*
		Returns the deepest InteractiveObject of subtree with mouseEnabled = true  OR itself, if "hit over" and mouseEnabled = false
	*/

_getTarget  (porg, pp) {
	return null;
};

_setStage  (st) {
	var pst = this.stage; // previous stage
	this.stage = st;
	if (pst == null && st != null) this.dispatchEvent(this._atsEv);
	if (pst != null && st == null) this.dispatchEvent(this._rfsEv);
};

/**
 * This method adds a drawing matrix onto the OpenGL stack
 */
_preRender  (st) {
	var m = this.transform._getTMat();
	st._mstack.push(m);
	st._cmstack.push(
		this.transform._cmat,
		this.transform._cvec,
		this.transform._cID,
		this.blendMode
	);
};

/**
 * This method renders the current content
 */
_render  (st) {};

/**
 * This method renders the whole object
 */
_renderAll  (st) {
	if (!this.visible) return;

	this._preRender(st);
	this._render(st);
	st._mstack.pop();
	st._cmstack.pop();
};

/*
		Absolute Transform matrix
	*/
_getATMat  () {
	if (this.parent == null) return this.transform._getTMat();
	Point._m4.multiply(
		this.parent._getATMat(),
		this.transform._getTMat(),
		this.transform._atmat
	);
	return this.transform._atmat;
};

/*
		Absolute Inverse Transform matrix
	*/
_getAIMat  () {
	if (this.parent == null) return this.transform._getIMat();
	Point._m4.multiply(
		this.transform._getIMat(),
		this.parent._getAIMat(),
		this.transform._aimat
	);
	return this.transform._aimat;
};

_getMouse  () {
	var lp = this._tempP;
	lp.setTo(Stage._mouseX, Stage._mouseY);
	this._globalToLocal(lp, lp);
	return lp;
};

}

/*
this.dp = DisplayObject.prototype;
dp.ds = dp.__defineSetter__;
dp.dg = dp.__defineGetter__;
*/

/*
	dp.ds("x", function(x){this.transform._tmat[12] = x; this.transform._imat[12] = -x;});
	dp.ds("y", function(y){this.transform._tmat[13] = y; this.transform._imat[13] = -y;});
	dp.ds("z", function(z){this.transform._tmat[14] = z; this.transform._imat[14] = -z;});
	dp.dg("x", function( ){return this.transform._tmat[12];});
	dp.dg("y", function( ){return this.transform._tmat[13];});
	dp.dg("z", function( ){return this.transform._tmat[14];});
	//*/

	/*
dp.ds('scaleX', function (sx) {
	this.transform._checkVals();
	this.transform._scaleX = sx;
	this.transform._mdirty = true;
});
dp.ds('scaleY', function (sy) {
	this.transform._checkVals();
	this.transform._scaleY = sy;
	this.transform._mdirty = true;
});
dp.ds('scaleZ', function (sz) {
	this.transform._checkVals();
	this.transform._scaleZ = sz;
	this.transform._mdirty = true;
});
dp.dg('scaleX', function () {
	this.transform._checkVals();
	return this.transform._scaleX;
});
dp.dg('scaleY', function () {
	this.transform._checkVals();
	return this.transform._scaleY;
});
dp.dg('scaleZ', function () {
	this.transform._checkVals();
	return this.transform._scaleZ;
});

dp.ds('rotationX', function (r) {
	this.transform._checkVals();
	this.transform._rotationX = r;
	this.transform._mdirty = true;
});
dp.ds('rotationY', function (r) {
	this.transform._checkVals();
	this.transform._rotationY = r;
	this.transform._mdirty = true;
});
dp.ds('rotationZ', function (r) {
	this.transform._checkVals();
	this.transform._rotationZ = r;
	this.transform._mdirty = true;
});
dp.ds('rotation', function (r) {
	this.transform._checkVals();
	this.transform._rotationZ = r;
	this.transform._mdirty = true;
});
dp.dg('rotationX', function () {
	this.transform._checkVals();
	return this.transform._rotationX;
});
dp.dg('rotationY', function () {
	this.transform._checkVals();
	return this.transform._rotationY;
});
dp.dg('rotationZ', function () {
	this.transform._checkVals();
	return this.transform._rotationZ;
});
dp.dg('rotation', function () {
	this.transform._checkVals();
	return this.transform._rotationZ;
});

dp.ds('width', function (w) {
	var ow = this.width;
	this.transform._postScale(w / ow, 1);
});
dp.ds('height', function (h) {
	var oh = this.height;
	this.transform._postScale(1, h / oh);
});

dp.dg('width', function () {
	this.transform._checkVals();
	return this._getParR(this, true).width;
});
dp.dg('height', function () {
	this.transform._checkVals();
	return this._getParR(this, true).height;
});

dp.ds('alpha', function (a) {
	this.transform._cmat[15] = a;
	this.transform._checkColorID();
});
dp.dg('alpha', function () {
	return this.transform._cmat[15];
});

dp.dg('mouseX', function () {
	return this._getMouse().x;
});
dp.dg('mouseY', function () {
	return this._getMouse().y;
});

delete dp.ds;
delete dp.dg;
delete this.dp;
*/
