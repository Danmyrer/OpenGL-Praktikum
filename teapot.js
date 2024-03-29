
/*****
/*
/* Ergänzungen zu einem 
/* Beispielprogramm für die Lehrveranstaltung Computergraphik
/* HS RheinMain
/* Prof. Dr. Ralf Dörner
/*
/* Dies ist kein eigenständiges Javascript, sondern enthält
/* "Code-Schnipsel", um im Beispielprogramm ein komplexeres Objekt
/* (Teekanne) darzustellen
/*
/****/


// Globale Variable

var teapotNormalData = [];
var teapotVertexData = [];
var teapotIndexData = [];
var teapotVertexIndexBuffer;


//
// Diese Funktion lädt die Daten aus einer Datei im JSON-Format,
// die lokal im selben Verzeichnis wie die anderen Projektdateien
// liegen sollte. Die Daten werden aus der Datei in interne Arrays
// gespeichert.
//
function loadTeapot() {
    var request = new XMLHttpRequest();

    request.open("GET", "Teapot.json");

    request.overrideMimeType("application/json");

    request.onreadystatechange = function () {

        if (request.readyState == 4) {

            var teapotData = JSON.parse(request.responseText);

            var i = 0;

            while (i < teapotData.vertexNormals.length) {
                teapotNormalData.push(teapotData.vertexNormals[i]);
                i++;
            }

            i = 0;

            while (i < teapotData.vertexPositions.length) {
                teapotVertexData.push(teapotData.vertexPositions[i]);
                i++;
            }

            i = 0;

            while (i < teapotData.indices.length) {
                teapotIndexData.push(teapotData.indices[i]);
                i++;
            }
        }
    }
    request.send();
}

//
// die Funktion drawTeapot kopiert die Daten aus der ausgelesenen und
// zwischengespeicherten Datei in OpenGL-Buffer und bereitet alles so
// vor, dass die Daten auf die "GPU-Seite" übergeben werden können


function drawTeapot(pos, scale, axis, rotSpeed) {
    let nVertices = [];
    let nNormals = [];

    // Transformationen
    for(let i = 0; i < teapotVertexData.length; i+=3) {
        point = new vec4(
            teapotVertexData[i],
            teapotVertexData[i+1],
            teapotVertexData[i+2],
            1
            );
            
            point = mult(scalem(scale[0], scale[1], scale[2]), point);
            point = mult(rotate(thetaGlobal * rotSpeed, axis), point);
            point = mult(translate(pos[0], pos[1], pos[2]), point);
            
            nVertices[i] = point[0];
            nVertices[i+1] = point[1];
            nVertices[i+2] = point[2];
        }
        
    for (let i = 0; i < teapotNormalData.length; i+=3) {
        //transformedVertexes[i] = teapotVertexData[i] / 3;
        point = new vec4(
            teapotNormalData[i], 
            teapotNormalData[i+1], 
            teapotNormalData[i+2], 
            1
        );
        
        // Normalen sind nicht richtungs / skalenabhängig
        point = mult(rotate(thetaGlobal*rotSpeed, axis), point);
        
        nNormals[i] = point[0];
        nNormals[i+1] = point[1];
        nNormals[i+2] = point[2];
    }

    var teapotVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nNormals), gl.STATIC_DRAW);
    teapotVertexNormalBuffer.itemSize = 3;
    teapotVertexNormalBuffer.numItems = nNormals.length / 3;

    var teapotVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nVertices), gl.STATIC_DRAW);
    teapotVertexPositionBuffer.itemSize = 3;
    teapotVertexPositionBuffer.numItems = nVertices.length / 3;

    teapotVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapotIndexData), gl.STATIC_DRAW);
    teapotVertexIndexBuffer.itemSize = 1;
    teapotVertexIndexBuffer.numItems = teapotIndexData.length;

    gl.enableVertexAttribArray(gl.getAttribLocation(program, "vPosition"));
    gl.enableVertexAttribArray(gl.getAttribLocation(program, "vNormal"));

    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(program, "vPosition"), teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(program, "vNormal"), teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);

    gl.disableVertexAttribArray(gl.getAttribLocation(program, "vColor"));
    gl.disableVertexAttribArray(gl.getAttribLocation(program, "vTexCoord"));

}


// dieser Aufruf sollte in der Funktion displayScene stehen, sobald alle Daten soweit vorbereitet sind
// um die Teekanne zu zeichnen - hier wird drawElements statt wie bislang drawArrays verwendet
//gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);





// dieser Aufruf sollte in der Funktion init hinzugefügt werden, damit die Daten für
// für die Teekanne einmalig aus der Datei ausgelesen werden

//loadTeapot();















