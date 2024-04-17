// Author: Tiancheng Yang
document.addEventListener('DOMContentLoaded', function() {
    setupStudentLinks();
    setupPublishAssignment();
    setupDropdowns();
	setupSubmitButton();
	setupReturnButton();
});

function setupReturnButton() {
    const returnBtn = document.getElementById('returnButton');
    returnBtn.addEventListener('click', function() {
        window.location.href = '/login';
    });
}

function setupSubmitButton() {
    document.getElementById('submitBtn').addEventListener('click', function() {
        const inputText = document.getElementById('inputText').value;
        submitStudentFeedback(inputText);
    });
}

function submitStudentFeedback(text) {
    const url = '/teacher_home';
    const dt_title = document.getElementById('currentTitle').value
    const dt_name = document.getElementById('currentStudent').value
	console.log("Title", document.getElementById('currentTitle').value);
	const data = {
        comment: text,
		title: dt_title,
		student: dt_name,
		type: 'feedback'
    };
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Feedback successfully submitted!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Failed to submit feedback');
    });
}

function setupStudentLinks() {
    const studentLinks = document.querySelectorAll('.student-link');
    studentLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const answer = this.getAttribute('data-answer');
			const title = this.getAttribute('data-title');
			const student = this.getAttribute('data-stu');
            console.log('Attempting to show content for:', title);
            showStudentContent(answer, title, student);
        });
    });
}

function showStudentContent(answer, title, student) {
    try {
        console.log("Received JSON:", answer);
        const parsedAnswer = JSON.parse(answer);
        document.getElementById('mySavedModel').value = answer;
        init();
        var myDiagram = go.Diagram.fromDiv("myDiagramDiv");
        myDiagram.model = go.Model.fromJson(parsedAnswer);
        displaySection('contentArea');
		defaultMessage.style.display = 'none';
        contentArea.style.display = 'block';
        imageContainer.style.display = 'block';
        assignmentArea.style.display = 'none';
		document.getElementById('currentTitle').value = title;
		document.getElementById('currentStudent').value = student;
        console.log("Received Title:", document.getElementById('currentTitle').value);
    } catch (e) {
        console.error('Error parsing JSON:', e);
    }
}

function setupPublishAssignment() {
    const publishButton = document.getElementById('publishAssignmentBtn');
    publishButton.addEventListener('click', function() {
        displaySection('assignmentArea');
    });
}

function displaySection(sectionId) {
    document.getElementById('defaultMessage').style.display = 'none';
    document.getElementById('contentArea').style.display = 'none';
    document.getElementById('assignmentArea').style.display = 'none';
    document.getElementById('imageContainer').style.display = 'none';

	console.log("ID", sectionId);
    document.getElementById(sectionId).style.display = 'block';
	console.log("ID", document.getElementById(sectionId).style.display);
}

function setupDropdowns() {
    const dropdownButtons = document.getElementsByClassName("dropdown-btn");
    Array.from(dropdownButtons).forEach(button => {
        button.addEventListener("click", function() {
            const dropdownContent = this.nextElementSibling;
            dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
        });
    });
}

function submitAssignment() {
    const title = document.getElementById('titleInput').value;
    const description = document.getElementById('descriptionInput').value;
    const data = { title: title, description: description, type: 'test' };

    fetch('/teacher_home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then(data => {
          console.log('Success:', data);
          alert('题目已成功提交');
      }).catch((error) => {
          console.error('Error:', error);
          alert('提交失败');
      });
}


	var isDiagramInitialized = false;
	function init() {
		if (isDiagramInitialized) return;
    isDiagramInitialized = true;
	if (window.goSamples) goSamples();
	var $ = go.GraphObject.make;
	myDiagram =
		$(go.Diagram, "myDiagramDiv",
		  {
		"LinkDrawn": showLinkLabel,
		"LinkRelinked": showLinkLabel,
		"undoManager.isEnabled": true
	});
	myDiagram.addDiagramListener("Modified", function(e) {
		var button = document.getElementById("SaveButton");
		if (button) button.disabled = !myDiagram.isModified;
		var idx = document.title.indexOf("*");
		if (myDiagram.isModified) {
			if (idx < 0) document.title += "*";
		} else {
			if (idx >= 0) document.title = document.title.substr(0, idx);
		}
	});
	function nodeStyle() {
		return [
			new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
			{
				locationSpot: go.Spot.Center
			}
		];
	}
	function makePort(name, align, spot, output, input) {
		var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
		return $(go.Shape,
				 {
			fill: "transparent",
			strokeWidth: 0,
			width: horizontal ? NaN : 8,
			height: !horizontal ? NaN : 8,
			alignment: align,
			stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
			portId: name,
			fromSpot: spot,
			fromLinkable: output,
			toSpot: spot,
			toLinkable: input,
			cursor: "pointer",
			mouseEnter: function(e, port) {
				if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
			},
			mouseLeave: function(e, port) {
				port.fill = "transparent";
			}
		});
	}
	function textStyle() {
		return {
			font: "bold 11pt Lato, Helvetica, Arial, sans-serif",
			stroke: "#F8F8F8"
		}
	}
	myDiagram.nodeTemplateMap.add("",
								  $(go.Node, "Table", nodeStyle(),
									$(go.Panel, "Auto",
									  $(go.Shape, "Rectangle",
										{ fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
										new go.Binding("figure", "figure")),
									  $(go.TextBlock, textStyle(),
										{
		margin: 8,
		maxSize: new go.Size(160, NaN),
		wrap: go.TextBlock.WrapFit,
		editable: true
	},
										new go.Binding("text").makeTwoWay())
									 ),
									makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
									makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
									makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
									makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
								   ));
	myDiagram.nodeTemplateMap.add("Conditional",
								  $(go.Node, "Table", nodeStyle(),
									$(go.Panel, "Auto",
									  $(go.Shape, "Diamond",
										{ fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
										new go.Binding("figure", "figure")),
									  $(go.TextBlock, textStyle(),
										{
		margin: 8,
		maxSize: new go.Size(160, NaN),
		wrap: go.TextBlock.WrapFit,
		editable: true
	},
										new go.Binding("text").makeTwoWay())
									 ),
									makePort("T", go.Spot.Top, go.Spot.Top, false, true),
									makePort("L", go.Spot.Left, go.Spot.Left, true, true),
									makePort("R", go.Spot.Right, go.Spot.Right, true, true),
									makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
								   ));
	myDiagram.nodeTemplateMap.add("Start",
								  $(go.Node, "Table", nodeStyle(),
									$(go.Panel, "Spot",
									  $(go.Shape, "Circle",
										{ desiredSize: new go.Size(70, 70), fill: "#282c34", stroke: "#09d3ac", strokeWidth: 3.5 }),
									  $(go.TextBlock, "Start", textStyle(),
										new go.Binding("text"))
									 ),
									makePort("L", go.Spot.Left, go.Spot.Left, true, false),
									makePort("R", go.Spot.Right, go.Spot.Right, true, false),
									makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
								   ));
	myDiagram.nodeTemplateMap.add("End",
								  $(go.Node, "Table", nodeStyle(),
									$(go.Panel, "Spot",
									  $(go.Shape, "Circle",
										{ desiredSize: new go.Size(60, 60), fill: "#282c34", stroke: "#DC3C00", strokeWidth: 3.5 }),
									  $(go.TextBlock, "End", textStyle(),
										new go.Binding("text"))
									 ),
									makePort("T", go.Spot.Top, go.Spot.Top, false, true),
									makePort("L", go.Spot.Left, go.Spot.Left, false, true),
									makePort("R", go.Spot.Right, go.Spot.Right, false, true)
								   ));
	go.Shape.defineFigureGenerator("File", function(shape, w, h) {
		var geo = new go.Geometry();
		var fig = new go.PathFigure(0, 0, true);
		geo.add(fig);
		fig.add(new go.PathSegment(go.PathSegment.Line, .75 * w, 0));
		fig.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
		fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
		fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
		var fig2 = new go.PathFigure(.75 * w, 0, false);
		geo.add(fig2);
		fig2.add(new go.PathSegment(go.PathSegment.Line, .75 * w, .25 * h));
		fig2.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
		geo.spot1 = new go.Spot(0, .25);
		geo.spot2 = go.Spot.BottomRight;
		return geo;
	});
	myDiagram.nodeTemplateMap.add("Comment",
								  $(go.Node, "Auto", nodeStyle(),
									$(go.Shape, "File",
									  { fill: "#282c34", stroke: "#DEE0A3", strokeWidth: 3 }),
									$(go.TextBlock, textStyle(),
									  {
		margin: 8,
		maxSize: new go.Size(200, NaN),
		wrap: go.TextBlock.WrapFit,
		textAlign: "center",
		editable: true
	},
									  new go.Binding("text").makeTwoWay())
								   ));
	myDiagram.linkTemplate =
		$(go.Link,
		  {
		routing: go.Link.AvoidsNodes,
		curve: go.Link.JumpOver,
		corner: 5, toShortLength: 4,
		relinkableFrom: true,
		relinkableTo: true,
		reshapable: true,
		resegmentable: true,
		mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
		mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; },
		selectionAdorned: false
	},
		  new go.Binding("points").makeTwoWay(),
		  $(go.Shape,
			{ isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
		  $(go.Shape,
			{ isPanelMain: true, stroke: "gray", strokeWidth: 2 },
			new go.Binding("stroke", "isSelected", function(sel) { return sel ? "dodgerblue" : "gray"; }).ofObject()),
		  $(go.Shape,
			{ toArrow: "standard", strokeWidth: 0, fill: "gray" }),
		  $(go.Panel, "Auto",
			{ visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
			new go.Binding("visible", "visible").makeTwoWay(),
			$(go.Shape, "RoundedRectangle",
			  { fill: "#F8F8F8", strokeWidth: 0 }),
			$(go.TextBlock, "Yes",
			  {
		textAlign: "center",
		font: "10pt helvetica, arial, sans-serif",
		stroke: "#333333",
		editable: true
	},
			  new go.Binding("text").makeTwoWay())
		   )
		 );
	function showLinkLabel(e) {
		var label = e.subject.findObject("LABEL");
		if (label !== null) label.visible = (e.subject.fromNode.data.category === "Conditional");
	}
	myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
	myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
	load();
	function animateFadeDown(e) {
		var diagram = e.diagram;
		var animation = new go.Animation();
		animation.isViewportUnconstrained = true;
		animation.easing = go.Animation.EaseOutExpo;
		animation.duration = 900;
		animation.add(diagram, 'position', diagram.position.copy().offset(0, 200), diagram.position);
		animation.add(diagram, 'opacity', 0, 1);
		animation.start();
	}
}
function save() {
	document.getElementById("mySavedModel").value = myDiagram.model.toJson();
	myDiagram.isModified = false;
}
function load() {
	myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
}
function printDiagram() {
	var svgWindow = window.open();
	if (!svgWindow) return;
	var printSize = new go.Size(700, 960);
	var bnds = myDiagram.documentBounds;
	var x = bnds.x;
	var y = bnds.y;
	while (y < bnds.bottom) {
		while (x < bnds.right) {
			var svg = myDiagram.makeSVG({ scale: 1.0, position: new go.Point(x, y), size: printSize });
			svgWindow.document.body.appendChild(svg);
			x += printSize.width;
		}
		x = bnds.x;
		y += printSize.height;
	}
	setTimeout(function() { svgWindow.print(); }, 1);
};
