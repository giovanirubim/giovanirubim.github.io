const vertexShader = `
	varying vec2 vUv;

	void main() {
	    vUv = uv;
	    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
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
	uniform float starsOpacity;
	uniform float gridOpacity;

	varying vec2 vUv;

	float oneInterval(float a) {
		return min(1.0, max(0.0, a));
	}

	float gridValue(float val, float sections, float thickness) {
		val = mod(val, 1.0/sections)*sections;
		float a = (thickness - val)/thickness*2.0;
		float b = (val - (1.0 - thickness))/thickness*2.0;
		return oneInterval(oneInterval(a) + oneInterval(b));
	}

	void main(void) {
		vec2 uv = vUv;
		uv.x = uv.x + 0.25;
		vec4 map = texture2D(earth, uv);
		vec4 star = texture2D(stars, vec2(
			mod(2.0 - uv.x + 0.2507 - ariesGHA, 1.0),
			uv.y
		));
		float grid =
			gridValue(uv.x, 36.0, 0.005) +
			gridValue(uv.y, 18.0, 0.005) +
			gridValue(uv.x, 360.0, 0.01) +
			gridValue(uv.y, 180.0, 0.01);
		vec3 c = map.rgb +
			vec3(oneInterval(grid)*gridOpacity) +
			star.rgb*starsOpacity;
		gl_FragColor = vec4(c, 1.0);
	}
`.replace(/\n\t/g, '\n').trim();
