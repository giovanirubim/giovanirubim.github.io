const vertexShader = `

	varying vec2 vUv;

	void main()
	{
	    vUv = uv;
	    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	    gl_Position = projectionMatrix * mvPosition;
	}

`.replace(/\n\t/g, '\n').trim();

const earthFrag = `
	
	#ifdef GL_ES
	precision highp float;
	#endif

	uniform sampler2D earth;
	uniform sampler2D stars;
	uniform float ariesGHA;

	varying vec2 vUv;

	float mod(float a, float b) {
		return a - (b * floor(a/b));
	}

	float oneInterval(float a) {
		return min(1.0, max(0.0, a));
	}

	float gridValue(float val, float div, float range) {
		val = mod(val, 1.0/div)*div;
		float a = (range - val)/range*2.0;
		float b = (val - (1.0 - range))/range*2.0;
		return oneInterval(oneInterval(a) + oneInterval(b));
	}

	void main(void)
	{
		vec4 map = texture2D(earth, vec2(mod(vUv.x + 0.25, 1.0), vUv.y));
		float img_x = 1.0 - vUv.x;
		img_x = mod(img_x + 0.00067 - ariesGHA/6.283185307179586 + 1.0, 1.0);
		float img_y = vUv.y;
		vec4 star = texture2D(stars, vec2(img_x, img_y));
		float mainGrid =
			gridValue(vUv.x, 36.0, 0.005) +
			gridValue(vUv.y, 18.0, 0.005);
		float minGrid = 
			gridValue(vUv.x, 360.0, 0.01) +
			gridValue(vUv.y, 180.0, 0.01);
		float bright = 0.0;
		bright +=
			oneInterval(mainGrid)*0.25 +
			oneInterval(minGrid)*0.1;
		bright += pow((star.r + star.g + star.b)/3.0, 1.5);
		vec3 c = map.rgb + vec3(bright);
		gl_FragColor = vec4(c, 1.0);
	}

`.replace(/\n\t/g, '\n').trim();
