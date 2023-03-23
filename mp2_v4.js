/**
 * CS418: MP2 - Dancing Logo
 * Arda Bedoyan
 * 
 * Javascript code to create 2D animations in WebGL2
 * Code includes compiling and linking shaders
 * and animating the Illini logo, in addition to optional components
 */



// compile and link the vertex and fragment shaders
function compileAndLinkGLSL(vs_source, fs_source) {
    // compile the vertex shader
    let vs = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vs, vs_source)
    gl.compileShader(vs)
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vs))
        throw Error("Vertex shader compilation failed")
    }

    // compile the fragment shader
    let fs = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fs, fs_source)
    gl.compileShader(fs)
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fs))
        throw Error("Fragment shader compilation failed")
    }
    
    // link the shaders in one program
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program))
        throw Error("Linking failed")
    }

    // return the program - this will help when switching between the multipele animations
    return program
}



// function to take in a JSON file and read its data into arrays
// provided by Professor Luther Tychonievich
function setupGeomery(geom, program) {
    var triangleArray = gl.createVertexArray()
    gl.bindVertexArray(triangleArray)

    Object.entries(geom.attributes).forEach(([name,data]) => {
        let buf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        let f32 = new Float32Array(data.flat())
        gl.bufferData(gl.ARRAY_BUFFER, f32, gl.STATIC_DRAW)
        
        let loc = gl.getAttribLocation(program, name)
        gl.vertexAttribPointer(loc, data[0].length, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(loc)
    })

    var indices = new Uint16Array(geom.triangles.flat())
    var indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    return {
        mode:gl.TRIANGLES,      // grab 3 indices per triangle
        count:indices.length,   // out of this many indices overall
        type:gl.UNSIGNED_SHORT, // each index is stored as a Uint16
        vao:triangleArray       // and this VAO knows which buffers to use
    }
}



/*
 * Required: The required animation of the Illini "I" logo
 * Movements included are rotation and scaling
 * The logo rotates clockwise as it shrinks and expands
 */
function draw1(milliseconds) {
    // set the background color to Illini blue
    gl.clearColor(0.075, 0.16, 0.292, 1)
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program1)

    // create the scale matrix based on time
    let sx = Math.cos(milliseconds/1000*0.5), sy = Math.cos(milliseconds/1000*0.5), sz = 1.0;
    let scaleFormMatrix = new Float32Array([sx,0,0,0, 0,sy,0,0, 0,0,sz,0, 0,0,0,1]);

    let scaleMatrix = gl.getUniformLocation(program1, 'scaleMatrix');
    gl.uniformMatrix4fv(scaleMatrix, false, scaleFormMatrix);

    // create the rotation matrix
    let c = Math.cos(milliseconds/1000), s = Math.sin(milliseconds/1000);
    let rotFormMatrix = new Float32Array([c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1]);

    let rotMatrix = gl.getUniformLocation(program1, 'rotMatrix');
    gl.uniformMatrix4fv(rotMatrix, false, rotFormMatrix);
    
    // bind the geometry of the "I" from the JSON file
    gl.bindVertexArray(geom1.vao)
    gl.drawElements(geom1.mode, geom1.count, geom1.type, 0)
    
    // requestAnimationFrame calls its callback at as close to your screen's refresh rate as it can manage; its argument is a number of milliseconds that have elapsed since the page was first loaded.
    window.pending = requestAnimationFrame(draw1)
}



/*
 * GPU-based vertex movement: The same function as draw1, which animates the Illini logo
 * Animation looks different because vertex shader has been updated
 * to create GPU-based vertex movement, by using the gl_VertexID of each vertex and seconds
 */
function draw2(milliseconds) {
    // set the background color to Illini blue
    gl.clearColor(0.075, 0.16, 0.292, 1)
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program2)

    // create a uniform seconds value
    let secondsBindPoint = gl.getUniformLocation(program2, 'seconds')
    gl.uniform1f(secondsBindPoint, milliseconds/1000)

    // create the scale matrix based on time
    let sx = Math.cos(milliseconds/1000*0.5), sy = Math.cos(milliseconds/1000*0.5), sz = 1.0;
    let scaleFormMatrix = new Float32Array([sx,0,0,0, 0,sy,0,0, 0,0,sz,0, 0,0,0,1]);

    let scaleMatrix = gl.getUniformLocation(program2, 'scaleMatrix');
    gl.uniformMatrix4fv(scaleMatrix, false, scaleFormMatrix);

    // create the rotation matrix that rotates about the z axis
    let c = Math.cos(milliseconds/1000), s = Math.sin(milliseconds/1000);
    let rotFormMatrix = new Float32Array([c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1]);

    let rotMatrix = gl.getUniformLocation(program2, 'rotMatrix');
    gl.uniformMatrix4fv(rotMatrix, false, rotFormMatrix);
    
    // bind the geometry of the "I" from the JSON file
    gl.bindVertexArray(geom2.vao)
    gl.drawElements(geom2.mode, geom2.count, geom2.type, 0)
    
    // requestAnimationFrame calls its callback at as close to your screen's refresh rate as it can manage; its argument is a number of milliseconds that have elapsed since the page was first loaded.
    window.pending = requestAnimationFrame(draw2)
}



/* 
 * Collisions: The draw function for the collision detection animation
 * Draws two "I" logos and has them move towards each other until they collide
 * Then they move away from each other
 */
function draw3(milliseconds) {
    // clear the canvas color and have it be white
    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program3)

    // create the translation matrix based on time for the left logo
    let lx = Math.cos(milliseconds/1000)/2 - 0.425, ly = 0, lz = 1.0;
    let transLeftFormMatrix = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, lx,ly,lz,1]);

    let transLeftMatrix = gl.getUniformLocation(program3, 'transLeftMatrix');
    gl.uniformMatrix4fv(transLeftMatrix, false, transLeftFormMatrix);

    // create the translation matrix based on time for the right logo
    let rx = -Math.cos(milliseconds/1000)/2 + 0.425, ry = 0, rz = 1.0;
    let transRightFormMatrix = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, rx,ry,rz,1]);

    let transRightMatrix = gl.getUniformLocation(program3, 'transRightMatrix');
    gl.uniformMatrix4fv(transRightMatrix, false, transRightFormMatrix);

    // bind the geometry of the "I" logos from the JSON file
    gl.bindVertexArray(geom3.vao)
    gl.drawElements(geom3.mode, geom3.count, geom3.type, 0)
    
    // requestAnimationFrame calls its callback at as close to your screen's refresh rate as it can manage; its argument is a number of milliseconds that have elapsed since the page was first loaded.
    window.pending = requestAnimationFrame(draw3)
}



/*
 * Psychedelic: The draw function for the psychedelic animation
 * Covers the entire canvas and has pulsing colors vertical lines
 * that alternate between green, purple, and orange colors
 */
function draw4(milliseconds) {
    // clear the canvas color and have it be white
    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program4)

    // create a uniform seconds value
    let secondsBindPoint = gl.getUniformLocation(program4, 'seconds')
    gl.uniform1f(secondsBindPoint, milliseconds/1000)

    // bind the geometry of the triangles that cover the canvas from the JSON file
    gl.bindVertexArray(geom4.vao)
    gl.drawElements(geom4.mode, geom4.count, geom4.type, 0)
    
    // requestAnimationFrame calls its callback at as close to your screen's refresh rate as it can manage; its argument is a number of milliseconds that have elapsed since the page was first loaded.
    window.pending = requestAnimationFrame(draw4)
}



/*
 * Walking: The draw function for the stick figure animation
 * The stick figure changes colors and moves left to right
 * It waves its arms and moves its legs independtly of the rest of its body to give the illusion of walking
 */
function draw5(milliseconds) {
    // clear the canvas color and have it be white
    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT) 
    gl.useProgram(program5)

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // create an empty list to pass the vertices of the stick figure into
    const vertices = [];

    // create the vertices for the triangles that will form a circle for the head
    for (let i=0; i < 720; i+=1){
        const angle1 = i * Math.PI / 180;
        const x1 = Math.cos(angle1);
        const y1 = Math.sin(angle1);
        vertices.push(x1/8 , y1/8 + 0.4);

        const angle2 = (i+1) * Math.PI / 180;
        const x2 = Math.cos(angle2);
        const y2 = Math.sin(angle2);
        vertices.push(x2/8 , y2/8 + 0.4);

        vertices.push(0,0.4);
    }

    // add the vertices for the lines of the body except for the head
    // body
    vertices.push(0,0.4);
    vertices.push(0,-0.2);
    // left arm
    vertices.push(0,0);
    vertices.push(-0.2,0.15);
    // right arm
    vertices.push(0,0);
    vertices.push(0.2,0.15);
    // left leg
    vertices.push(0,-0.2);
    vertices.push(-0.01,-0.5);
    // right leg
    vertices.push(0,-0.2);
    vertices.push(0.01,-0.5);
    

    // create the rotation matrix for the left arm and leg of the stick figure
    let lc = Math.cos(30 * Math.PI / 180), ls = Math.sin(15 * Math.PI / 180) * Math.sin(milliseconds/300);
    let leftRotFormMatrix = new Float32Array([lc,-ls,0,0, ls,lc,0,0, 0,0,1,0, 0,0,0,1]);

    let leftRotMatrix = gl.getUniformLocation(program5, 'leftRotMatrix');
    gl.uniformMatrix4fv(leftRotMatrix, false, leftRotFormMatrix);

    // create the rotation matrix for the right arm and leg of the stick figure
    let rc = Math.cos(30 * Math.PI / 180), rs = Math.sin(15 * Math.PI / 180) * Math.sin(milliseconds/300);
    let rightRotFormMatrix = new Float32Array([rc,rs,0,0, -rs,rc,0,0, 0,0,1,0, 0,0,0,1]);

    let rightRotMatrix = gl.getUniformLocation(program5, 'rightRotMatrix');
    gl.uniformMatrix4fv(rightRotMatrix, false, rightRotFormMatrix);

    // create the translation matrix to move the stick figure
    let x = Math.cos(milliseconds/3000)/1.5, y = 0.0, z = 1.0;
    let transFormMatrix = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]);

    let transMatrix = gl.getUniformLocation(program5, 'transMatrix');
    gl.uniformMatrix4fv(transMatrix, false, transFormMatrix);

    // create a uniform seconds value
    let secondsBindPoint = gl.getUniformLocation(program5, 'seconds')
    gl.uniform1f(secondsBindPoint, milliseconds/1000)

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const positionAttributeLocation = gl.getAttribLocation(program5, "position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // draw the head
    gl.drawArrays(gl.TRIANGLES, 0, 1080);
    // draw the body, arms, and legs
    gl.drawArrays(gl.LINES, 1080, vertices.length);
    
    // requestAnimationFrame calls its callback at as close to your screen's refresh rate as it can manage; its argument is a number of milliseconds that have elapsed since the page was first loaded.
    window.pending = requestAnimationFrame(draw5)
}



/*
 * Mouse response: The draw function that has movement react to the mouse
 * Draws a circle that changes color each click as a function of the x and y mouse click locations
 * When the right half of the canvas is clicked, the circle moves in a counter clockwise direction
 * When the left half of the canvas is clicked, the circle moves in a clockwise direction
 * The size of the circle also depends on the location of the mouse click
 */
function draw6(milliseconds) {
    // clear the canvas color and have it be greenish-gray
    gl.clearColor(0.8, 0.9, 0.8, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program6)

    const ballBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ballBuffer);

    // create an empty list to pass the vertices of the circle to draw
    const verts = [];

    // create the vertices for the triangles that will form a circle
    for (let i=0; i < 720; i+=1){
        const angle1 = i * Math.PI / 180;
        const x1 = Math.cos(angle1);
        const y1 = Math.sin(angle1);
        verts.push(x1/8 , y1/8);

        const angle2 = (i+1) * Math.PI / 180;
        const x2 = Math.cos(angle2);
        const y2 = Math.sin(angle2);
        verts.push(x2/8 , y2/8);

        verts.push(0,0);
    }

    // create the counter clockwise motion for when the mouse is clicked on the right half of the canvas
    let xCCW = Math.cos(milliseconds/400)/3,
        yCCW = Math.sin(milliseconds/400)/3;

    let ccwFormMatrix = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, xCCW,yCCW,0,1]);
    let ccwMatrix = gl.getUniformLocation(program6, 'ccwMatrix');
    gl.uniformMatrix4fv(ccwMatrix, false, ccwFormMatrix);
   
    // create the clockwise motion for when the mouse is clicked on the left half of the canvas
    let xCW = Math.cos(milliseconds/400)/3,
        yCW = -Math.sin(milliseconds/400)/3;

    let cwFormMatrix = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, xCW,yCW,0,1]);
    let cwMatrix = gl.getUniformLocation(program6, 'cwMatrix');
    gl.uniformMatrix4fv(cwMatrix, false, cwFormMatrix);


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const positionAttributeLocation = gl.getAttribLocation(program6, "position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // draw the circle
    gl.drawArrays(gl.TRIANGLES, 0, verts.length);

    // event listener for the mouse down action
    document.addEventListener('mousedown', (e) => {
        // get the position of the click
        let mouseX = e.clientX - c.offsetLeft;
        let mouseY = e.clientY - c.offsetTop;

        // change the coordinates to world view
        let worldX = (2 * mouseX / c.width) - 1;
        let worldY = 1 - (2 * mouseY / c.height);

        // pass along the x and y click coordinates to the vertex shader
        let clickX = gl.getUniformLocation(program6, 'mouseX')
        gl.uniform1f(clickX, worldX)

        let clickY = gl.getUniformLocation(program6, 'mouseY')
        gl.uniform1f(clickY, worldY)
    })

    window.pending = requestAnimationFrame(draw6)
}



/** Callback for when the radio button selection changes */
function radioChanged() {
    let chosen = document.querySelector('input[name="mp2"]:checked').value
    cancelAnimationFrame(window.pending)
    window.pending = requestAnimationFrame(window['draw'+chosen])
}



/** Resizes the canvas to be a square that fits on the screen with at least 20% vertical padding */
function resizeCanvas() {
    window.c = document.querySelector('canvas')
    c.width = c.parentElement.clientWidth
    c.height = document.documentElement.clientHeight * 0.8
    console.log(c.width, c.height)
    if (c.width > c.height) c.width = c.height
    else c.height = c.width
}



async function setup(event) {
    resizeCanvas()
    window.gl = document.querySelector('canvas').getContext('webgl2')
    
    /* 
     * Create the program for the Required animation 
     */
    let vs1 = await fetch('vertexShader.glsl').then(res => res.text())
    let fs1 = await fetch('fragmentShader.glsl').then(res => res.text())
    window.program1 = compileAndLinkGLSL(vs1,fs1)

    // fetch the geometry data for the "I" logo
    let data1 = await fetch('mp2.json').then(r=>r.json())
    window.geom1 = setupGeomery(data1, program1)


    /*
     * Create the program for optional section - GPU-based vertex movement 
     */
    let vs2 = await fetch('vertexShaderGPU.glsl').then(res => res.text())
    let fs2 = await fetch('fragmentShader.glsl').then(res => res.text())
    window.program2 = compileAndLinkGLSL(vs2,fs2)

    // fetch the geometry data for the "I" logo
    let data2 = await fetch('mp2.json').then(r=>r.json())
    window.geom2 = setupGeomery(data2, program2)
    

    /*
     * Create the program for the Collision animation 
     */
    let vs3 = await fetch('vertexShaderColl.glsl').then(res => res.text())
    let fs3 = await fetch('fragmentShader.glsl').then(res => res.text())
    window.program3 = compileAndLinkGLSL(vs3,fs3)

    // fetch the geometry data for the "I" logos
    let data3 = await fetch('mp2_Collision.json').then(r=>r.json())
    window.geom3 = setupGeomery(data3, program3)


    /* 
     * Create the program for the Psychedelic animation 
     */
    let vs4 = await fetch('vertexShaderPsy_v2.glsl').then(res => res.text())
    let fs4 = await fetch('fragmentShaderPsy_v2.glsl').then(res => res.text())
    window.program4 = compileAndLinkGLSL(vs4,fs4)

    // fetch the geometry data for the triangles
    let data4 = await fetch('mp2_Psy_v3.json').then(r=>r.json())
    window.geom4 = setupGeomery(data4, program4)


    /*
     * Create the program for the stick figure animation 
     */
    let vs5 = await fetch('vertexShaderWalk.glsl').then(res => res.text())
    let fs5 = await fetch('fragmentShaderWalk.glsl').then(res => res.text())
    window.program5 = compileAndLinkGLSL(vs5,fs5)


    /*
     * Create the program for the stick figure animation 
     */
    let vs6 = await fetch('vertexShaderMouse.glsl').then(res => res.text())
    let fs6 = await fetch('fragmentShaderMouse.glsl').then(res => res.text())
    window.program6 = compileAndLinkGLSL(vs6,fs6)


    document.querySelectorAll('input[name="mp2"]').forEach(elem => {
        elem.addEventListener('change', radioChanged)
    })
    radioChanged()
}

window.addEventListener('load', setup)

