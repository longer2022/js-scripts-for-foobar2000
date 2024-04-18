/**
 * origin: https://lib.ivank.net/ by Ivan Kuckir
 *
 */

class EventDispatcher {
	/** hash table for listeners ... Key (Event type) : Array of functions */
	private lsrs = {};
	/** hash table for objects   ... Key (Event type) : Array of Objects, on
	 * which function should be called */
	private cals = {}; 

	/** objects, on which EnterFrame will be broadcasted */
	static efbc = [];

	hasEventListener (type) {
		let fs = this.lsrs[type];		// functions for this event
		if (fs == null) return false;
		return (fs.length > 0);
	}

	addEventListener (type, f) {
		this.addEventListener2(type, f, null);
	}

	addEventListener2 (type, f, o)	{// string, function 
		if(this.lsrs[type] == null)
			{
				this.lsrs[type] = [];
				this.cals[type] = [];
			}
			this.lsrs[type].push(f);
			this.cals[type].push(o);

			if(type == Event.ENTER_FRAME)
				{
					var arEF = EventDispatcher.efbc;
					if(arEF.indexOf(this) < 0) arEF.push(this);
				}
	}
removeEventListener(type, f){	// string, function
	var fs = this.lsrs[type];		// functions for this event
	if (fs == null) return;
	var ind = fs.indexOf(f);
	if(ind < 0) return;
	var cs = this.cals[type];
	fs.splice(ind, 1);
	cs.splice(ind, 1);

	if(type == Event.ENTER_FRAME && fs.length == 0)
	{
		var arEF = EventDispatcher.efbc;
		arEF.splice(arEF.indexOf(this), 1);
	}
}

dispatchEvent(e){
	// Event
	e.currentTarget = this;
	if(e.target == null) e.target = this;

	var fs = this.lsrs[e.type];
	if (fs == null) return;
	var cs = this.cals[e.type];
	for (var i=0; i<fs.length; i++)
	{
		if(cs[i] == null) fs[i](e);
		else fs[i].call(cs[i], e);
	}
}


}








function Event(type, bubbles)
{
	if(!bubbles) bubbles= false;
	this.type			= type;
	this.target			= null;
	this.currentTarget	= null;
	this.bubbles		= bubbles;
}

Event.ENTER_FRAME			= "enterFrame";
Event.RESIZE				= "resize";
Event.ADDED_TO_STAGE 		= "addedToStage";
Event.REMOVED_FROM_STAGE 	= "removedFromStage";

Event.CHANGE				= "change";

Event.OPEN					= "open";
Event.PROGRESS				= "progress";
Event.COMPLETE				= "complete";//	package net.ivank.events;

function MouseEvent(type, bubbles)
{
	Event.call(this, type, bubbles);

	this.movementX = 0;
	this.movementY = 0;
}
MouseEvent.prototype = new Event();


MouseEvent.CLICK		= "click";
MouseEvent.MOUSE_DOWN	= "mouseDown";
MouseEvent.MOUSE_UP		= "mouseUp";

MouseEvent.MIDDLE_CLICK	= "middleClick";
MouseEvent.MIDDLE_MOUSE_DOWN	= "middleMouseDown";
MouseEvent.MIDDLE_MOUSE_UP		= "middleMouseUp";

MouseEvent.RIGHT_CLICK	= "rightClick";
MouseEvent.RIGHT_MOUSE_DOWN	= "rightMouseDown";
MouseEvent.RIGHT_MOUSE_UP	= "rightMouseUp";

MouseEvent.MOUSE_MOVE	= "mouseMove";
MouseEvent.MOUSE_OVER	= "mouseOver";
MouseEvent.MOUSE_OUT	= "mouseOut";//	package net.ivank.events;

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
