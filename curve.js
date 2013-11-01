var SCALE = 30.0;
var canvas, context, gravity, world;
var mouseX, mouseY;
var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    setUpCurve();
    //document.addEventListener("mousedown", handleMouseDown, true);
    document.addEventListener("mouseup", handleMouseUp, true);
    // for IOS & Android
    //document.addEventListener("touchstart",handleMouseDown, true);
    //document.addEventListener("touchend",handleMouseUp, true);

    window.setInterval(update, 1000 / 60);
}

function setUpCurve() {
    gravity = new b2Vec2(0, 10);
    world = new b2World(gravity, true);
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.userData = 'polygon'

    // place the first point, "pointA" in the upper left hand corner.
    var pointA = new b2Vec2(0.0/SCALE, 0.0/SCALE);

    // point to the second point, "pointB" about a third from the left and the bottom
	var pointB = new b2Vec2((canvas.width/3)/SCALE, canvas.height/SCALE);

    var pointC = new b2Vec2(mouseX / SCALE, mouseY / SCALE);
    var pointD = new b2Vec2(mouseX / SCALE, mouseY / SCALE);

    var x1 = pointA.x;
    var y1 = pointA.y
    var x2, y2;
    var i;

    bodyDef.position.Set(x1, y1);

    // create 100 points

    var curve = world.CreateBody(bodyDef);
    for (i = 0; i < 1.01; i += 0.01) {

        var ax = Math.pow((1 - i), 3) * pointA.x;
        var ay = Math.pow((1 - i), 3) * pointA.y;
        var bx = 3 * i * Math.pow((1 - i), 2) * pointB.x;
        var by = 3 * i * Math.pow((1 - i), 2) * pointB.y;
        var cx = 3 * Math.pow(i, 2) * (1 - i) * pointC.x;
        var cy = 3 * Math.pow(i, 2) * (1 - i) * pointC.y;
        var dx = Math.pow(i, 3) * pointD.x;
        var dy = Math.pow(i, 3) * pointD.y;

        x2 = ax + bx + cx + dx;
        y2 = ay + by + cy + dy;

        var edgeShape = new b2PolygonShape();
        edgeShape.SetAsEdge(new b2Vec2(x1, y1), new b2Vec2(x2, y2));
        curve.CreateFixture2(edgeShape);

        x1 = x2;
        y1 = y2;
    }

}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'grey';
    var body = world.GetBodyList();
    while (body) {
        var type = body.GetType();
        if (type == 2) {
            var radius = body.GetFixtureList().GetShape().GetRadius();


            var rotation = body.GetAngle() * (180 / Math.PI);
			var x = body.GetWorldCenter().x * SCALE;
		    var y = body.GetWorldCenter().y * SCALE;

			var velocity = body.GetLinearVelocity().x
			velocity= Math.round(velocity * 100) / 100
			var direction = "right"
			if (velocity < 0) direction = "left";

			console.log("direction = "+direction);

            context.save();
            context.translate(x,y);
            context.rotate(rotation);


            drawing = new Image();
			drawing.src = "ball.png";
			context.drawImage(drawing,0,0,20,20);
 			//context.beginPath();
           // context.arc(0, 0, radius * SCALE, 0, Math.PI * 2, false);
           // context.stroke()
            context.restore();
        } else if (type == 0) {
            var fixture = body.GetFixtureList();
            while (fixture) {
                context.beginPath();
                var vs = fixture.GetShape().GetVertices();
                for (var i = 0; i < vs.length; i++) {
                    var x = vs[i].x * SCALE
                    var y = vs[i].y * SCALE
                    if (i == 0) {
                        context.moveTo(x, y)
                    } else {
                        context.lineTo(x, y);
                    }
                }
                context.stroke();
                fixture = fixture.GetNext();
            }
        }
        body = body.GetNext();
    }

    // draw joints
    var joint = world.GetJointList();
    while (joint) {
        ax = joint.GetAnchorA().x * SCALE
        ay = joint.GetAnchorA().y * SCALE
        bx = joint.GetAnchorB().x * SCALE
        by = joint.GetAnchorB().y * SCALE
        context.beginPath();
        context.moveTo(ax, ay);
        context.lineTo(bx, by);
        context.stroke();
        joint = joint.GetNext();
    }
    context.closePath();
    drawControlPoints();
}

function drawControlPoints() {

/*
	context.strokeStyle = 'blue';
    context.beginPath();
    context.arc(mouseX, mouseY, 5, 0, Math.PI * 2, true);
    context.lineWidth = .5;
    context.stroke();

   	context.closePath();

	context.beginPath();
    context.moveTo(0, mouseY);
    context.lineTo(canvas.width, mouseY);
	context.moveTo(mouseX, 0);
	context.lineTo(mouseX, canvas.height);
    context.stroke();
    context.closePath();
*/
}

function update() {
    world.Step(1 / 60, 10, 10);
    draw();
    world.ClearForces();
}


function drawCurve(x,y) {
    isMouseDown = true;
    mouseX = x*SCALE;
    mouseY = y*SCALE;
    setUpCurve();
}

function handleMouseUp(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    var fixDef = new b2FixtureDef();
    fixDef.density = 0.0;
    fixDef.friction = 0.0;
    fixDef.restitution = 0.0;
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.userData = 'ball';
    bodyDef.position.x = 1;
    bodyDef.position.y = 0;
    fixDef.shape = new b2CircleShape(10 / SCALE);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
}