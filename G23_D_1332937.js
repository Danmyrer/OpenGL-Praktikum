
    /*****
    /*
    /* Beispielprogramm für die Lehrveranstaltung Computergraphik
    /* HS RheinMain
    /* Prof. Dr. Ralf Dörner
    /*
    /* basierend auf einem Programm von Edward Angel
    /* http://www.cs.unm.edu/~angel/WebGL/
    /*
    /****/


    /***   Deklaration globaler Variablen */

    // Referenz auf Bereich, in den gezeichnet wird
    var canvas;

    // Referenz auf WebGL-Kontext, über die OpenGL Befehle ausgeführt werden
    var gl;

    let shininess = 100;
    let ambientIntensity = 0.3;

    let disableCartoon = false;
    let isCartoon = false;
    let cartoonThreshLow = 0.3;
    let cartoonThreshHigh = 0.75;


    // Referenz auf die Shaderprogramme
    var program;

    // Matrix für die Umrechnung Objektkoordinaten -> Weltkoordinaten
    var model;

    // Matrix für die Umrechnung Weltkoordinaten -> Kamerakoordinaten
    var view;

    // Matrix für die Umrechnung Kamerakoordinaten -> Clippingkoordinaten
    var projection;

    // Matrix für die Umrechnung von Normalen aus Objektkoordinaten -> Viewkoordinaten
    var normalMat;

    // Flag, das angibt, ob eine Beleuchtungsrechnung durchgeführt wird (true)
    // oder ob einfach die übergebenen Eckpunktfarben übernommen werden (false)
    var lighting = true;

    // Anzahl der Eckpunkte der zu zeichenden Objekte 
    var numVertices = 0;

    // Array, in dem die Koordinaten der Eckpunkte der zu zeichnenden Objekte eingetragen werden
    var vertices = [];

    // Array, in dem die Farben der Eckpunkte der zu zeichnenden Objekte eingetragen werden
    var colors = [];

    // Array, in dem die Eckpunktkoordinaten der zu zeichnenden Objekte eingetragen werden
    var pointsArray = [];

    // Array, in dem die Normale je Eckpunkt der zu zeichnenden Objekte eingetragen werden
    var normalsArray = [];

    // Array, in dem die Farbwerte je Eckpunkt der zu zeichnenden Objekte eingetragen werden
    var colorsArray = [];

    // Array ,in dem die Texturkoordinaten je Eckpunkt der zu zeichenenedn Objekte eingetrageen werden.
    var texArray = [];

    // Variablen für die Drehung des Würfels
    var axis = 0;
    var theta = [0, 0, 0];
    var thetaGlobal = 0;
    var enableRotation = false;

    // Variablen, um die Anzahl der Frames pro Sekunde zu ermitteln
    var then = Date.now();
    var counter = 0;

    // OpenGL-Speicherobjekt f�r Farben
    var cBuffer;

    // OpenGL-Speicherobjekt f�r Vertices
    var vBuffer;

    // OpenGL-Speicherobjekt f�r Normalen
    var nBuffer;

    // OpenGL-Speicherobjekt für Texturen
    var tBuffer;

    /*** Hilfsfunktionen zum Zeichnen von Objekten */


    //
    // Funktion, die ein Quadrat in das pointsArray, colorsArray und normalsArray einträgt
    // Das Quadrat wird dabei in zwei Dreiecke trianguliert, da OpenGL keine Vierecke 
    // nativ zeichnen kann.
    //
    // Übergeben werden für Indices auf die vier Eckpunkte des Vierecks
    //

    function quad(a, b, c, d, tex = false) {

        // zunächst wird die Normale des Vierecks berechnet. t1 ist der Vektor von Eckpunkt a zu Eckpunkt b
        // t2 ist der Vektor von Eckpunkt von Eckpunkt a zu Eckpunkt c. Die Normale ist dann das 
        // Kreuzprodukt von t1 und t2
        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[a]);
        var normal = cross(t1, t2);
        normal = vec3(normal);

        // und hier kommt die Eintragung der Infos für jeden Eckpunkt (Koordinaten, Normale, Farbe) in die globalen Arrays
        // allen Eckpunkten wird die gleiche Farbe zugeordnet, dabei 

        // erstes Dreieck
        pointsArray.push(vertices[a]);
        normalsArray.push(normal);
        colorsArray.push(colors[a + (colors.length - 7)]);

        pointsArray.push(vertices[b]);
        normalsArray.push(normal);
        colorsArray.push(colors[a + (colors.length - 7)]);

        pointsArray.push(vertices[c]);
        normalsArray.push(normal);
        colorsArray.push(colors[a + (colors.length - 7)]);

        // zweites Dreieck
        pointsArray.push(vertices[a]);
        normalsArray.push(normal);
        colorsArray.push(colors[a + (colors.length - 7)]);

        pointsArray.push(vertices[c]);
        normalsArray.push(normal);
        colorsArray.push(colors[a + (colors.length - 7)]);

        pointsArray.push(vertices[d]);
        normalsArray.push(normal);
        colorsArray.push(colors[a + (colors.length - 7)]);

        texArray.push(
            // Erstes Dreieck
            0.0, 0.0, 
            2.0, 0.0, 
            2.0, 2.0, 
            // Zweites Dreieck
            0.0, 0.0, 
            2.0, 2.0, 
            0.0, 2.0
        );

        // durch die beiden Dreiecke wurden 6 Eckpunkte in die Array eingetragen
        numVertices += 6;
    }

    function vertex(a, b, c) {
        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[a]);
        var normal = cross(t1, t2);

        pointsArray.push(vertices[a]);
        normalsArray.push(normal);
        colorsArray.push(colors[a + (colors.length - 4)]);

        pointsArray.push(vertices[b]);
        normalsArray.push(normal);
        colorsArray.push(colors[a + (colors.length - 4)]);

        pointsArray.push(vertices[c]);
        normalsArray.push(normal);
        colorsArray.push(colors[a + (colors.length - 4)]);

        numVertices += 3;
    }


    //
    // Funktion, die einen Würfel zeichnet (Mittelpunkt liegt im Ursprung, Kantenlänge beträgt 1)
    //

    function drawCube(pos = [5, 0, 1], rotAxis = [0, 0, 1], scl = [1, 1, 1], matCl = vec4(1.0, 1.0, 0.0, 1.0), speed = 1, cpu = false, tex = false) {

        // zunächst werden die Koordinaten der 8 Eckpunkte des Würfels definiert
        vertices = [
            vec4(-0.5, -0.5, 0.5, 1.0), // 0
            vec4(-0.5, 0.5, 0.5, 1.0), // 1
            vec4(0.5, 0.5, 0.5, 1.0),  // 2 
            vec4(0.5, -0.5, 0.5, 1.0),  // 3
            vec4(-0.5, -0.5, -0.5, 1.0), // 4
            vec4(-0.5, 0.5, -0.5, 1.0), // 5
            vec4(0.5, 0.5, -0.5, 1.0),  // 6
            vec4(0.5, -0.5, -0.5, 1.0)   // 7
        ];

        // Rotation des Würfels um seine z-Achse
        for (var i = 0; i < vertices.length; i++) {
            vertices[i] = mult(scalem(scl[0], scl[1], scl[2]), vertices[i]);
            vertices[i] = mult(rotate(thetaGlobal * speed, rotAxis), vertices[i]);
            vertices[i] = mult(translate(pos[0], pos[1], pos[2]), vertices[i]);
        }

        // Hier wird die Farbe des Würfels für später gespeichert
        if(!cpu) {
            for (var i = 0; i < 6; i++) {
                colors.push(matCl);
            }
        }
        else {
            colors.push(new vec4(1.0, 0.0, 0.0, 1.0));
            colors.push(new vec4(0.0, 0.0, 0.0, 1.0));
            colors.push(new vec4(0.0, 0.0, 0.0, 1.0));
            colors.push(new vec4(1.0, 0.0, 0.0, 1.0));
            colors.push(new vec4(0.0, 0.0, 0.0, 1.0));
            colors.push(new vec4(0.0, 0.0, 0.0, 1.0));
        }

        // und hier werden die Daten der 6 Seiten des Würfels in die globalen Arrays eingetragen
        // jede Würfelseite erhält eine andere Farbe
        quad(1, 0, 3, 2, tex);
        quad(2, 3, 7, 6, tex);
        quad(3, 0, 4, 7, tex);
        quad(6, 5, 1, 2, tex);
        quad(4, 5, 6, 7, tex);
        quad(5, 4, 0, 1, tex);

        // die eingetragenen Werte werden an den Shader übergeben
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

        var vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texArray), gl.STATIC_DRAW);

        var vTexture = gl.getAttribLocation(program, "vTexture");
        gl.vertexAttribPointer(vTexture, 2, gl.FLOAT, false, 0, 0),
        gl.enableVertexAttribArray(vTexture);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

        var cPosition = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(cPosition);
    }

    function drawPyramid(pos = [0, 0, 0], scl = [1, 1, 1], matCl = vec4(1.0, 1.0, 1.0, 1.0), rot = 0, rotAx = [0, 1, 0]) {

        vertices = [
            vec4(0.5, 0, 0.5, 1.0), // 0
            vec4(0.5, 0, -0.5, 1.0), // 1
            vec4(-0.5, 0, 0.5, 1.0), // 2
            vec4(-0.5, 0, -0.5, 1.0), // 3
            vec4(0.0, 1.0, 0.0, 1.0) // 4
        ]

        // Transformationen
        for (var i = 0; i < vertices.length; i++) {
            vertices[i] = mult(scalem(scl[0], scl[1], scl[2]), vertices[i]);
            vertices[i] = mult(rotate(rot, rotAx), vertices[i]);
            vertices[i] = mult(translate(pos[0], pos[1], pos[2]), vertices[i]);
        }

        for (var i = 0; i < 6; i++) {
            colors.push(matCl);
        }

        quad(2, 3, 1, 0);
        vertex(0, 1, 4);
        vertex(0, 4, 2);
        vertex(2, 4, 3);
        vertex(3, 4, 1);

        // die eingetragenen Werte werden an den Shader übergeben
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

        var vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

        var cPosition = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(cPosition);
    }

    /*** Funktionen zum Aufbau der Szene */

    //
    // Funktion zum setzen der inneren und äußeren Parameter der Kamera
    //

    function setCamera() {

        // es wird ermittelt, welches Element aus der Kameraauswahlliste aktiv ist
        var camIndex = document.getElementById("Cameralist").selectedIndex;

        // Punkt, an dem die Kamera steht  
        var eye;

        // Punkt, auf den die Kamera schaut
        var vrp;

        // Vektor, der nach oben zeigt  
        var upv;

        switch(camIndex) {
            case 4:
                eye = vec3(12.0, 12.0, 4.0);
                vrp = vec3(0.0, 4.0, 0.0);
                upv = vec3(0.0, 1.0, 0.0);
                break;
            case 3: // z-Achse
                eye = vec3(0.0, 0.0, 10.0);
                vrp = vec3(0.0, 0.0, 0.0);
                upv = vec3(0.0, 1.0, 0.0);
                break;
            case 2: // y-Achse
                eye = vec3(0.0, 10.0, 0.0);
                vrp = vec3(0.0, 0.0, 0.0);
                upv = vec3(0.0, 0.0, 1.0);
                break;
            case 1: // x-Achse
                eye = vec3(10.0, 0.0, 0.0);
                vrp = vec3(0.0, 0.0, 0.0);
                upv = vec3(0.0, 1.0, 0.0);
                break;
            default: // default
                eye = vec3(12.0, 12.0, 4.0);
                vrp = vec3(0.0, 0.0, 0.0);
                upv = vec3(0.0, 1.0, 0.0);
        }

        // hier wird die Viewmatrix unter Verwendung einer Hilfsfunktion berechnet,
        // die in einem externen Javascript (MV.js) definiert wird
        view = lookAt(eye, vrp, upv);

        // die errechnete Viewmatrix wird an die Shader übergeben
        // die Funktion flatten löst dabei die eigentlichen Daten aus dem Javascript-Array-Objekt
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "viewMatrix"), false, flatten(view));

        // nachdem die inneren Parameter gesetzt wurden, werden nun die äußeren Parameter gesetzt
        // dazu wird die Projektionmatrix mit einer Hilfsfunktion aus einem externen Javascript (MV.js)
        // definiert
        // der Field-of-View wird auf 60° gesetzt, das Seitenverhältnis ist 1:1 (d.h. das Bild ist quadratisch),
        // die near-Plane hat den Abstand 0.01 von der Kamera und die far-Plane den Abstand 100
        projection = perspective(60.0, 1.0, 0.01, 100.0);

        // die errechnete Viewmatrix wird an die Shader übergeben
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projection));

    }


    //
    // die Funktion spezifiziert die Lichtquellen, führt schon einen Teil der Beleuchtungsrechnung durch
    // und übergibt die Werte an den Shader
    // 
    // der Parameter materialDiffuse ist ein vec4 und gibt die Materialfarbe für die diffuse Reflektion an
    //

    function calculateLights(materialDiffuse, materialSpecular) {
        // zunächst werden die Lichtquellen spezifiziert (bei uns gibt es eine Punktlichtquelle)

        // die Position der Lichtquelle (in Weltkoordinaten)
        var lightPosition = vec4(7.0, 7.0, 0.0, 1.0);

        // die Farbe der Lichtquelle im diffusen Licht
        var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);

        // dann wird schon ein Teil der Beleuchtungsrechnung ausgeführt - das könnte man auch im Shader machen
        // aber dort würde diese Rechnung für jeden Eckpunkt (unnötigerweise) wiederholt werden. Hier rechnen wir
        // das Produkt aus lightDiffuse und materialDiffuse einmal aus und übergeben das Resultat. Zur Multiplikation
        // der beiden Vektoren nutzen wir die Funktion mult aus einem externen Javascript (MV.js)
        var diffuseProduct = mult(lightDiffuse, materialDiffuse);

        // die Werte für die Beleuchtungsrechnung werden an die Shader übergeben

        // Übergabe der Position der Lichtquelle
        // flatten ist eine Hilfsfunktion, welche die Daten aus dem Javascript - Objekt herauslöst
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

        // Übergabe des diffuseProduct
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));

        // Übergabe der LightDiffuse
        gl.uniform4fv(gl.getUniformLocation(program, "lightDiffuse"), flatten(lightDiffuse));

        // Übergabe der materialSpecular
        gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"), flatten(materialSpecular));

        // Übergabe der shininess
        gl.uniform1f(gl.getUniformLocation(program, "shiny"), shininess);

        // Übergabe der ambientIntensity
        gl.uniform1f(gl.getUniformLocation(program, "ambient"), ambientIntensity);

        gl.uniform1i(gl.getUniformLocation(program, "fIsCartoon"), isCartoon);
        gl.uniform1f(gl.getUniformLocation(program, "fCartoonThreshLow"), cartoonThreshLow);
        gl.uniform1f(gl.getUniformLocation(program, "fCartoonThreshHigh"), cartoonThreshHigh);
    }

    function initDisplayScene() {
        setCamera();

        numVertices = 0;
        pointsArray.length = 0;
        colorsArray.length = 0;
        normalsArray.length = 0;

        // Initialisierung mit der Einheitsmatrix 
        model = mat4();
        
        // Das Objekt wird am Ende noch um die x-Achse rotiert 
        model = mult(model, rotate(theta[0], [1, 0, 0]));
        
        // Zuvor wird das Objekt um die y-Achse rotiert
        model = mult(model, rotate(theta[1], [0, 1, 0]));
        
        // Als erstes wird das Objekt um die z-Achse rotiert 
        model = mult(model, rotate(theta[2], [0, 0, 1]));
        
        // die Model-Matrix ist fertig berechnet und wird an die Shader übergeben 
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(model));
        
        // jetzt wird noch die Matrix errechnet, welche die Normalen transformiert
        normalMat = mat4();
        normalMat = mult(view, model);
        normalMat = inverse(normalMat);
        normalMat = transpose(normalMat);
        
        // die Normal-Matrix ist fertig berechnet und wird an die Shader übergeben 
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "normalMatrix"), false, flatten(normalMat));
    }

    function setLighting(x) {
        lighting = x;
        gl.uniform1i(gl.getUniformLocation(program, "lighting"), x);
    }

    function setTexture(x) {
        isTexture = x;
        gl.uniform1i(gl.getUniformLocation(program, "fIsTexture"), x);
    }
    
    function setCartoon(x, threshLow = 0.3, threshHigh = 0.75) {
        if(disableCartoon) {
            isCartoon = false;
        }
        else {
            isCartoon = x;
        }
        gl.uniform1i(gl.getUniformLocation(program, "fIsCartoon"), isCartoon);
        if(isCartoon) {
            gl.uniform1f(gl.getUniformLocation(program, "fCartoonThreshLow"), cartoonThreshLow);
            gl.uniform1f(gl.getUniformLocation(program, "fCartoonThreshHigh"), cartoonThreshHigh);
        }
    }

    function drawWithLight(
        diffColor = vec4(1.0, 1.0, 1.0, 1.0), 
        specColor = vec4(1.0, 1.0, 1.0, 1.0)
    ) {
        if (lighting) {
            calculateLights(diffColor, specColor);
        }
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    function displayScene() {
        initDisplayScene();

        // Definieren der Farben
        let col_yellow = vec4(1.0, 1.0, 0.0, 1.0);
        let col_white = vec4(1.0, 1.0, 1.0, 1.0);
        let col_red = vec4(1.0, 0.0, 0.0, 1.0);
        let col_blue = vec4(0.0, 0.0, 1.0 ,1.0);

        // Grüner Texturierter Würfel
        setLighting(true);
        setTexture(true);
        setCartoon(false);
        drawCube([5, 0, -3], [1, 0, 0], [2, 2, 2], vec4(0.0, 1.0, 0.0, 1.0), 2, false, true);
        drawWithLight(col_yellow, col_white);

        // Gelbe Pyramide
        setTexture(false);
        drawPyramid([0, 0, 0], [4, 4, 2], vec4(1.0, 1.0, 0.0, 1.0));
        drawWithLight(col_yellow, col_blue);

        // Rote Pyramide
        drawPyramid([0, 8, 0], [4, 4, 2], vec4(1.0, 0.0, 0.0, 1.0), 180, [1, 0, 0]);
        drawWithLight(col_red, col_white);

        // Blaue Pyramide
        drawPyramid([0, 6.666, 0.666], [1.6, 1.6, 0.8], vec4(0.0, 0.0, 1.0, 1.0), 104, [1, 0, 0]);
        drawWithLight(col_blue, col_white);

        // CPU-Würfel
        setLighting(false);
        drawCube([5, 0, 1], [0, 0, 1], [1, 1, 1], vec4(0.0, 0.0, 0.0, 1.0), 1, true);
        drawWithLight();

        // Teekanne
        setLighting(true);
        setCartoon(true);
        drawWithLight(col_yellow, col_white);
        drawTeapot(
            vec3(-5.0,0.0,6.0),
            vec3(0.3,0.3,0.3),
            vec3(0,1,0),
            17.039
        );  // Hier muss die lichtberechnung VORHER stattfinden,
            // da der Kanne keine explizite Farbe zugeordnet ist
        gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    var render = function () {

        // den Framebuffer (hier wird das Bild hineingeschrieben) und den z-Buffer (wird für Verdeckungsrechnung benötigt)
        // initialisieren.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        document.getElementById("c1").innerText = (cartoonThreshLow*100).toFixed(0)+"%";
        document.getElementById("c2").innerText = (cartoonThreshHigh*100).toFixed(0)+"%";
        document.getElementById("ai").innerText = (ambientIntensity*100).toFixed(0)+"%";
        document.getElementById("sh").innerText = shininess;

        // Durchführung der Animation: der Würfel wird um 2° weiter gedreht und zwar um die aktuell ausgewählte Achse
        if (enableRotation) theta[axis] += 2.0;
        thetaGlobal += 1.0;

        // jetzt kann die Szene gezeichnet werden
        displayScene();

        // Berechnung der FPS alle 20 Frames
        counter++;
        var freq = 20;
        if (counter >= freq) {
            var fps = 1000 / ((Date.now() - then) / freq)
            document.getElementById("fps").innerHTML = "FPS: " + fps.toPrecision(2);

            // Zurücksetzen der Zähler
            counter = 0;
            then = Date.now();
        }

        // der Frame fertig gezeichnet ist, wird veranlasst, dass der nächste Frame gezeichnet wird. Dazu wird wieder
        // die die Funktion aufgerufen, welche durch die Variable render spezifiziert wird
        requestAnimFrame(render);
    }




    /*** Funktionen zur Ausführung von WebGL  */


    //
    // Diese Funktion wird beim Laden der HTML-Seite ausgeführt. Sie ist so etwas wie die "main"-Funktion
    // Ziel ist es, WebGL zu initialisieren
    //

    window.onload = function init() {

        // Laden von externen Assets
        loadTeapot();
        
        // die Referenz auf die Canvas, d.h. den Teil des Browserfensters, in den WebGL zeichnet, 
        // wird ermittelt (über den Bezeichner in der HTML-Seite)
        canvas = document.getElementById("gl-canvas");

        // über die Canvas kann man sich den WebGL-Kontext ermitteln, über den dann die OpenGL-Befehle
        // ausgeführt werden
        gl = WebGLUtils.setupWebGL(canvas);
        if (!gl) { alert("WebGL isn't available"); }

        // allgemeine Einstellungen für den Viewport (wo genau das Bild in der Canvas zu sehen ist und
        // wie groß das Bild ist)
        gl.viewport(0, 0, canvas.width, canvas.height);

        // die Hintergrundfarbe wird festgelegt
        gl.clearColor(0.9, 0.9, 1.0, 1.0);

        // die Verdeckungsrechnung wird eingeschaltet: Objekte, die näher an der Kamera sind verdecken
        // Objekte, die weiter von der Kamera entfernt sind
        gl.enable(gl.DEPTH_TEST);

        // der Vertex-Shader und der Fragment-Shader werden initialisiert
        program = initShaders(gl, "vertex-shader", "fragment-shader");

        // die über die Refenz "program" zugänglichen Shader werden aktiviert
        gl.useProgram(program);

        // OpenGL Speicherobjekte anlegen
        vBuffer = gl.createBuffer();
        nBuffer = gl.createBuffer();
        cBuffer = gl.createBuffer();
        tBuffer = gl.createBuffer();

        // die Callbacks für das Anklicken der Buttons wird festgelegt
        // je nachdem, ob man den x-Achsen, y-Achsen oder z-Achsen-Button klickt, hat
        // axis einen anderen Wert
        document.getElementById("ButtonX").onclick = function () { axis = 0; };
        document.getElementById("ButtonY").onclick = function () { axis = 1; };
        document.getElementById("ButtonZ").onclick = function () { axis = 2; };
        document.getElementById("ButtonT").onclick = function () { enableRotation = !enableRotation };
        document.getElementById("Cartoon").onclick = function () { disableCartoon = !disableCartoon };
        document.getElementById("SliderS").oninput = function(event){shininess = event.target.value;};
        document.getElementById("SliderA").oninput = function(event){ambientIntensity = (event.target.value/100);};
        document.getElementById("SliderT1").oninput = function(event){cartoonThreshLow = (event.target.value/100);};
        document.getElementById("SliderT2").oninput = function(event){cartoonThreshHigh = (event.target.value/100);};

        document.getElementById("SliderS").value = shininess;
        document.getElementById("SliderA").value = ambientIntensity * 100;
        document.getElementById("SliderT1").value = cartoonThreshLow * 100;
        document.getElementById("SliderT2").value = cartoonThreshHigh * 100;

        // Laden von Texturen
        var img = document.getElementById("texImage");
        var t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.uniform1i(gl.getUniformLocation(program, "src"), 0);

        // jetzt kann mit dem Rendern der Szene begonnen werden  
        render();
    }
