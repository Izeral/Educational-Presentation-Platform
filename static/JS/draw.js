// Author: Tiancheng Yang
function init() {
    if (window.goSamples) goSamples();
    const $ = go.GraphObject.make;
    
    myDiagram =
        new go.Diagram("myDiagramDiv",
        {
            "LinkDrawn": showLinkLabel,
            "LinkRelinked": showLinkLabel,
            "undoManager.isEnabled": true
        });

    myDiagram.addDiagramListener("Modified", e => {
        var button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
        if (idx < 0) document.title += "*";
        } else {
        if (idx >= 0) document.title = document.title.slice(0, idx);
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
            mouseEnter: (e, port) => {
            if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
            },
            mouseLeave: (e, port) => port.fill = "transparent"
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
    
    go.Shape.defineFigureGenerator("File", (shape, w, h) => {
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
            mouseEnter: (e, link) => link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)",
            mouseLeave: (e, link) => link.findObject("HIGHLIGHT").stroke = "transparent",
            selectionAdorned: false
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,
            { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
        $(go.Shape,
            { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
            new go.Binding("stroke", "isSelected", sel => sel ? "dodgerblue" : "gray").ofObject()),
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

    myPalette =
        new go.Palette("myPaletteDiv",
        {
            "animationManager.initialAnimationStyle": go.AnimationManager.None,
            "InitialAnimationStarting": animateFadeDown,
            nodeTemplateMap: myDiagram.nodeTemplateMap,
            model: new go.GraphLinksModel([
            { category: "Start", text: "Start" },
            { text: "Step" },
            { category: "Conditional", text: "Judgment" },
            { category: "End", text: "End" },
            { category: "Comment", text: "Comment" }
            ])
        });

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
        var jsonText = document.getElementById("mySavedModel").value;
        myDiagram.model = go.Model.fromJson(jsonText);
    }
    
    function save() {
        var jsonText = myDiagram.model.toJson();
        document.getElementById("mySavedModel").value = jsonText;
        myDiagram.isModified = false;
    }
    
    
    window.addEventListener('DOMContentLoaded', init);
    
    window.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);

        const title = params.get('title') ? decodeURIComponent(params.get('title')) : '';
        const description = params.get('description') ? decodeURIComponent(params.get('description')) : '';

        const titleElement = document.getElementById('title');
        const descriptionElement = document.getElementById('description');

        titleElement.textContent = title;
        descriptionElement.textContent = description;
    });
    document.getElementById('returnButton').addEventListener('click', function() {
        window.location.href = '/login';
    });
    
    document.getElementById('showComments').addEventListener('click', function() {
        const teacher_comment = document.getElementById('teacherComment').value;
        alert('Teacher\'s Comment: ' + teacher_comment);
    });
