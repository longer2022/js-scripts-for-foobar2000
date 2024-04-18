/**
 * origin: https://lib.ivank.net/ by Ivan Kuckir
 *
 */

class EventDispatcher {
	/** hash table for listeners ... Key (Event type) : Array of functions */
	private lsrs: { [key: string]: Function[] } = {};
	/** hash table for objects   ... Key (Event type) : Array of Objects, on
	 * which function should be called */
	private cals: { [key: string]: Object[] } = {};

	/** objects, on which EnterFrame will be broadcasted */
	static efbc: Object[] = [];

	hasEventListener(type: string) {
		let fs = this.lsrs[type];		// functions for this event
		if (fs == null) return false;
		return (fs.length > 0);
	}

	addEventListener(type: string, f: Function) {
		this.addEventListener2(type, f, null);
	}

	addEventListener2(type: string, f: Function, o: Object) {// string, function
		if (this.lsrs[type] == null) {
			this.lsrs[type] = [];
			this.cals[type] = [];
		}
		this.lsrs[type].push(f);
		this.cals[type].push(o);

		if (type == FbEvent.ENTER_FRAME) {
			var arEF = EventDispatcher.efbc;
			if (arEF.indexOf(this) < 0) arEF.push(this);
		}
	}

	removeEventListener(type: string, f: Function) {	// string, function
		var fs = this.lsrs[type];		// functions for this event
		if (fs == null) return;
		var ind = fs.indexOf(f);
		if (ind < 0) return;
		var cs = this.cals[type];
		fs.splice(ind, 1);
		cs.splice(ind, 1);

		if (type == FbEvent.ENTER_FRAME && fs.length == 0) {
			var arEF = EventDispatcher.efbc;
			arEF.splice(arEF.indexOf(this), 1);
		}
	}

	dispatchEvent(e: FbEvent) {
		// Event
		e.currentTarget = this;
		if (e.target == null) e.target = this;

		var fs = this.lsrs[e.type];
		if (fs == null) return;
		var cs = this.cals[e.type];
		for (var i = 0; i < fs.length; i++) {
			if (cs[i] == null) fs[i](e);
			else fs[i].call(cs[i], e);
		}
	}


}








class FbEvent {

	type: string;
	target: Object;
	currentTarget: Object;
	bubbles: boolean = false;


	static ENTER_FRAME = "enterFrame";
	static RESIZE = "resize";
	static ADDED_TO_STAGE = "addedToStage";
	static REMOVED_FROM_STAGE = "removedFromStage";

	static CHANGE = "change";

	static OPEN = "open";
	static PROGRESS = "progress";
	static COMPLETE = "complete";//	package net.ivank.events;

	constructor(type: string, bubbles: boolean = false) {
		if (!bubbles) bubbles = false;
		this.type = type;
		this.target = null;
		this.currentTarget = null;
		this.bubbles = bubbles;
	}


}


class FbMouseEvent extends FbEvent {

	movementX = 0;
	movementY = 0;

	static CLICK = "click";
	static MOUSE_DOWN = "mouseDown";
	static MOUSE_UP = "mouseUp";

	static MIDDLE_CLICK = "middleClick";
	static MIDDLE_MOUSE_DOWN = "middleMouseDown";
	static MIDDLE_MOUSE_UP = "middleMouseUp";

	static RIGHT_CLICK = "rightClick";
	static RIGHT_MOUSE_DOWN = "rightMouseDown";
	static RIGHT_MOUSE_UP = "rightMouseUp";

	static MOUSE_MOVE = "mouseMove";
	static MOUSE_OVER = "mouseOver";
	static MOUSE_OUT = "mouseOut";//	package net.ivank.events;

	constructor(type: string, bubbles: boolean = false) {
		super(type, bubbles);
	}

}



function TouchEvent(type, bubbles)
{
	Event.call(this, type, bubbles);

	this.stageX = 0;
	this.stageY = 0;
	this.touchPointID = -1;
}
TouchEvent.prototype = new Event();

TouchEvent.prototype._setFromDom = function(t)
{
	var dpr = window.devicePixelRatio || 1;
	this.stageX = t.clientX*dpr;
	this.stageY = t.clientY*dpr;
	this.touchPointID = t.identifier;
}

TouchEvent.TOUCH_BEGIN  = "touchBegin";
TouchEvent.TOUCH_END    = "touchEnd";
TouchEvent.TOUCH_MOVE   = "touchMove";
TouchEvent.TOUCH_OUT    = "touchOut";
TouchEvent.TOUCH_OVER   = "touchOver";
//TouchEvent.TOUCH_ROLL_OUT = "touchRollOut";
//TouchEvent.TOUCH_ROLL_OVER = "touchRollOver";
TouchEvent.TOUCH_TAP = "touchTap";
//	package net.ivank.display;


function KeyboardEvent(type, bubbles)
{
	Event.call(this, type, bubbles);

	this.altKey = false;
	this.ctrlKey = false;
	this.shiftKey = false;

	this.keyCode = 0;
	this.charCode = 0;
}
KeyboardEvent.prototype = new Event();

KeyboardEvent.prototype._setFromDom = function(e)
{
	//console.log(e);
	this.altKey		= e.altKey;
	this.ctrlKey	= e.ctrlKey;
	this.shiftKey	= e.shiftKey;

	this.keyCode	= e.keyCode;
	this.charCode	= e.charCode;
}

KeyboardEvent.KEY_DOWN	= "keyDown";
KeyboardEvent.KEY_UP	= "keyUp";
