import * as Babylon from 'babylonjs';
import { getInputValues, xyz2url } from './utils';

const dom = {
	canvas: document.getElementById("render3d") as HTMLCanvasElement,
	imgRasterTile: document.getElementById("rasterTileImage") as HTMLImageElement
}

// 3Dエンジンを読み込む
const engine = new Babylon.Engine(dom.canvas, true, {
	preserveDrawingBuffer: true,
	stencil: true
});
// ステージのセッティング
const initializeScene = () => {
	// シーンを作成
	const scene = new Babylon.Scene(engine);
	// カメラを作成
	const camera = new Babylon.ArcRotateCamera("camera1", 0, Math.PI / 2.5, 3, new Babylon.Vector3(0, 250, -500), scene);
	camera.setTarget(Babylon.Vector3.Zero());
	camera.attachControl(dom.canvas, false);
	// ライトを作成
	new Babylon.HemisphericLight("light1", new Babylon.Vector3(1000, 1000, 0), scene);
	// グラウンドを作成
	Babylon.MeshBuilder.CreateGround("ground1", {
		width: 256,
		height: 256,
		subdivisions: 2,
		updatable: false
	}, scene);
	return scene;
}

const createPolygon = (rasterTileEndpoint: string, xyz: { zoomLevel: number, coord_x: number, coord_y: number }, scene: Babylon.Scene) => {
	const material = new Babylon.StandardMaterial("ground2", scene);
	const rasterTileUrl = xyz2url(rasterTileEndpoint, xyz);
	material.diffuseTexture = new Babylon.Texture(rasterTileUrl, scene);
	const demTileEndpoint = "https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png"
	const demTileUrl = xyz2url(demTileEndpoint, xyz);
	const ground = Babylon.Mesh.CreateGroundFromHeightMap("ground2", demTileUrl, 256, 256, 1010, 10, 0, scene);
	ground.material = material;
	ground.position.y = 0;
}

let scene = initializeScene();
engine.runRenderLoop(() => {
	scene.render();
});
window.addEventListener("resize", () => {
	engine.resize();
});

// 表示ボタンを押したとき
document.getElementById("showButton").addEventListener("click", async () => {
	const { tileUrl, ...xyz } = getInputValues();
	scene = initializeScene();
	createPolygon(tileUrl, xyz, scene);
});
// プレビューボタンを押したとき
document.getElementById("previewButton").addEventListener("click", () => {
	const { tileUrl, ...xyz } = getInputValues();
	const url = xyz2url(tileUrl, xyz);
	dom.imgRasterTile.src = url;
});
