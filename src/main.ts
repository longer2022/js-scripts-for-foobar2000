import { onMouseLbtnDown, onPaint, onSize } from "src/common/callbacks";
import { randomColor } from "src/common/helpers";
import { Panel, Rect, Splitter, SplitterItem, WindowPanel } from "src/common/panel_splitter";
import { AutoLayout } from "node_modules/@lume/autolayout/dist/AutoLayout";

export function fillRect(gr: GdiGraphics, bounds: Rect, color: number) {
	gr.FillSolidRect(bounds.x, bounds.y, bounds.width, bounds.height, color);
}

export function printLayout(panel: Panel, indent: number = 0) {
	console.log(" ".repeat(indent) + (panel.children.length > 0 ? "\u2193" : " ") + " " + panel.caption)
	for (let i = 0; i < panel.children.length; i++) {
		printLayout(panel.children[i], indent + 2);
	}
}

/**
 * draw a panel and it's children;
 */
function drawPanel(gr: GdiGraphics, panel: Panel) {
	if (!panel || !panel.visible) return;

	// draw self;
	fillRect(gr, panel.bounds, randomColor());
	panel.draw && panel.draw(gr);

	// draw children;
	for (let i = 0; i < panel.children.length; i++) {
		drawPanel(gr, panel.children[i]);
	}
}

function layoutPanel(panel: Panel) {
	if (!panel || !panel.visible) return;

	panel.layout && panel.layout();

	for (let i = 0; i < panel.children.length; i++) {
		layoutPanel(panel.children[i]);
	}
}


///////////////////////////////////////////////////////
// test panel

const _test_panel = new WindowPanel();
const a = new Splitter();
const b = new Panel();

b.caption += " - b"
_test_panel.addChild([a, b]);

const c = new SplitterItem();
const d = new SplitterItem();

a.addSplitterItem([c, d])

_test_panel.boundsProps = {
	x: 0, y: 0, width: () => window.Width, height: () => window.Height
}

a.boundsProps = {
	x: 50,
	y: 50,
	width: () => a.parent.bounds.width / 2,
	height: () => a.parent.bounds.height - 100,
}

b.boundsProps = {
	x: () => a.bounds.right,
	y: () => a.bounds.bottom,
	width: 100,
	height: 20
}

onSize.event(() => {
	layoutPanel(_test_panel);
});

onPaint.event((gr: GdiGraphics) => {
	drawPanel(gr, _test_panel);
});

onMouseLbtnDown.event((event) => {
	const result = _test_panel.findPanel(event.x, event.y)
	if (result) {
		console.log(result.caption);
	}
	console.log("removeChild", _test_panel.removeChild(result))
	window.Repaint();
});


// print layout tree
console.log("------------------ layout ----------------")
printLayout(_test_panel, 0);
console.log("------------------------------------------")


