# OpenGL-Praktikum

## Aufgabe 1

### ab)
Erledigt.

### d)
```js
// Durchführung der Animation: der Würfel wird um 2° weiter gedreht und zwar um die aktuell ausgewählte Achse
if (enableRotation) theta[axis] += 2.0;
thetaGlobal += 1.0;
```

```js
// Rotation
for (var i = 0; i < vertices.length; i++) {
    vertices[i] = mult(scalem(scl[0], scl[1], scl[2]), vertices[i]);
    vertices[i] = mult(rotate(thetaGlobal * speed, rotAxis), vertices[i]);
    vertices[i] = mult(translate(pos[0], pos[1], pos[2]), vertices[i]);
}
```

FPS:
```js
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
```

## Aufgabe 2

### a)

```js
// CPU-Würfel
setLighting(false);
drawCube([5, 0, 1], [0, 0, 1], [1, 1, 1], vec4(0.0, 0.0, 0.0, 1.0), 1, true);
drawWithLight();
```

```js
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
```

```js
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
```

### b)

```js
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
```


### c)

```js
// Gelbe Pyramide
setTexture(false);
drawPyramid([0, 0, 0], [4, 4, 2], vec4(1.0, 1.0, 0.0, 1.0));
drawWithLight(col_yellow, col_blue);
```

```js
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
```

```js
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
```

### d)

```js
// Rote Pyramide
drawPyramid([0, 8, 0], [4, 4, 2], vec4(1.0, 0.0, 0.0, 1.0), 180, [1, 0, 0]);
drawWithLight(col_red, col_white);
```

### e)

```js
// Blaue Pyramide
drawPyramid([0, 6.666, 0.666], [1.6, 1.6, 0.8], vec4(0.0, 0.0, 1.0, 1.0), 104, [1, 0, 0]);
drawWithLight(col_blue, col_white);
```

### f)
Implizit umgesetzt

## Aufgabe 3

### abc)

```js
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
```

### def)

- D: Es wird umfassender, Kamera erfasst mehr Inhalt
- E: Objekte die zu nah an der Kamera sind werden nicht ganz gerendert
- F: In der HTML ist immer noch ein Maß von 16:9 eingestellt

## Aufgabe 4

### ab)

Siehe Aufgabe 2a)
- Durch kein Shading sind alle Flächen monochrom, was die Ansicht erschwert

### cd)

```h
// Berechnung der spekularen Reflektion nach Phong-Blinn
vec3 E = normalize(-pos);
vec3 H = normalize(L+E);

float Ks = pow(max(dot(N, H), 0.0), shiny);
vec4 specular = Ks * materialSpecular;

if (dot(L,N) < 0.0) {
    specular = vec4(0.0, 0.0, 0.0, 1.0);
}

// resultierende Farbe für Fragment-Shader bestimmen
fColor = vec4(diffuse.xyz, 1.0) + ambient * vColor + vec4(specular.xyz, 1.0);
fTexture = vTexture;
```

### ef)

- E: Bei niedriger Shininess werden die reflektierten Felder immer größer und extremer Weiß
- F: Je höher die Ambient intensity, desto "weißer" werden die Objekte
    - Bei mir ist die intensity auf per-Objekt-Basis, dh. z.B ein Rotes Viereck wird immer roter und der shading lässt sich weniger bis gar nicht erkennen.
    - Für weiße Umsetzung einfach vColor durch vec4(1.0, 1.0, 1.0, 1.0) ersetzen

## Aufgabe 5

### a)

```html
<!-- HSRM GIF -->
<img id="texImage" src="hsrm.gif" hidden></img>
```

### b)

```js
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
```

### c)

```js
texArray.push(
    // Erstes Dreieck
    0.0, 0.0, 
    1.0, 0.0, 
    1.0, 1.0, 
    // Zweites Dreieck
    0.0, 0.0, 
    1.0, 1.0, 
    0.0, 1.0
);
```

### de)

```js
// wir übernehmen hier einfach den übergebenen Wert
if (fIsTexture == true) {
gl_FragColor = mix(fColor, texture2D(texture, fTexture), 0.7);
}
```

## Aufgabe 6

### a)

```js
// Laden von externen Assets
loadTeapot();
```

```js
// Teekanne
setLighting(true);
setCartoon(true);
drawWithLight(col_yellow, col_white);
drawTeapot(
    vec3(-5.0,0.0,6.0),
    vec3(0.3,0.3,0.3),
    vec3(0,1,0),
    5.039
);  // Hier muss die lichtberechnung VORHER stattfinden,
    // da der Kanne keine explizite Farbe zugeordnet ist
gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
```

### b)

```h
else if (fIsCartoon == true) {
vec3 luminanceV = vec3(
    0.2126,
    0.7152,
    0.0722
);
float luminance = dot(fColor.rgb, luminanceV);
luminance = clamp(luminance, 0.0, 1.0);

if(luminance < fCartoonThreshLow) {
    // Hier kann man natürlich auch einfach direkt die Farbe setzen
    // aber das wäre zu einfach
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);

    // Konvertierung in Grayscale
    vec3 ntscGrayscaleV = vec3(
    0.299,
    0.587,
    0.114
    );
    float ntscGrayscale = dot(fColor.rgb, ntscGrayscaleV);

    // Anpassen der Helligkeit
    float brightGrayscale = 0.2 * ntscGrayscale;

    // Runden auf den ganzzahligen Graubereich
    brightGrayscale = clamp((brightGrayscale / 255.0),0.0,1.0);
    gl_FragColor = vec4(brightGrayscale, brightGrayscale, brightGrayscale, 1.0);
}
else if(luminance > fCartoonThreshHigh) {
    gl_FragColor = vec4(0.9, 0.7, 0.0, 1.0);
}
else {
    gl_FragColor = vec4(0.6, 0.4, 0.1, 1.0);
}
}
```

### cde)

```html
<div>
<button id="ButtonX">Rotate X</button>
<button id="ButtonY">Rotate Y</button>
<button id="ButtonZ">Rotate Z</button>
<button id="ButtonT">Rotate On/Off</button>
<button id="Cartoon">Cartoon On/Off</button>
</div>

<div>
Thresholds Cartoon Shading:
<input type="range" id="SliderT1" min="0" max="100">
<input type="range" id="SliderT2" min="0" max="100">
<label id="c1">1</label>, <label id="c2">1</label>
<br />
Ambient Intensity:
<input type="range" id="SliderA" min="0" max="100">
<label id="ai">1</label>
<br />
Shininess:
<input type="range" id="SliderS" min="0" max="100">
<label id="sh">100</label>
</div>
```

```js
document.getElementById("Cartoon").onclick = function () { disableCartoon = !disableCartoon };
document.getElementById("SliderS").oninput = function(event){shininess = event.target.value;};
document.getElementById("SliderA").oninput = function(event){ambientIntensity = (event.target.value/100);};
document.getElementById("SliderT1").oninput = function(event){cartoonThreshLow = (event.target.value/100);};
document.getElementById("SliderT2").oninput = function(event){cartoonThreshHigh = (event.target.value/100);};

document.getElementById("SliderS").value = shininess;
document.getElementById("SliderA").value = ambientIntensity * 100;
document.getElementById("SliderT1").value = cartoonThreshLow * 100;
document.getElementById("SliderT2").value = cartoonThreshHigh * 100;
```

### e)

```js
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
```