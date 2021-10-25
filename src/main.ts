import * as Babylon from 'babylonjs';

const dom = {
	canvas: document.getElementById("render3d") as HTMLCanvasElement,
	inputZoomLevel: document.getElementById("zoomLevel") as HTMLInputElement,
	inputCoordX: document.getElementById("coord_x") as HTMLInputElement,
	inputCoordY: document.getElementById("coord_y") as HTMLInputElement,
	imgRasterTile: document.getElementById("rasterTileImage") as HTMLImageElement,
	selectTile: document.getElementById("rasterTileSelect") as HTMLSelectElement
}
// キャンバスを取得
const canvas = document.getElementById("render3d");
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
	camera.attachControl(canvas, false);
	// ライトを作成
	const light = new Babylon.HemisphericLight("light1", new Babylon.Vector3(1000, 1000, 0), scene);
	// グラウンドを作成
	const ground = Babylon.MeshBuilder.CreateGround("ground1", {
		width: 256,
		height: 256,
		subdivisions: 2,
		updatable: false
	}, scene);
	return scene;
}

const createPolygon = (rasterTileUrl: string, xyz: { zoomLevel: number, coord_x: number, coord_y: number }, scene: Babylon.Scene) => {
	const url = rasterTileUrl.replace("{z}", xyz.zoomLevel.toString()).replace("{x}", xyz.coord_x.toString()).replace("{y}", xyz.coord_y.toString());
	const material = new Babylon.StandardMaterial("ground2", scene);
	material.diffuseTexture = new Babylon.Texture(url, scene);
	const demTileUrl = `https://cyberjapandata.gsi.go.jp/xyz/relief/${xyz.zoomLevel}/${xyz.coord_x}/${xyz.coord_y}.png`;
	const ground = Babylon.Mesh.CreateGroundFromHeightMap("ground2", demTileUrl, 256, 256, 1010, 30, 0, scene);
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

document.getElementById("showButton").addEventListener("click", async () => {
	const zoomLevel = parseInt(dom.inputZoomLevel.value);
	const coord_x = parseInt(dom.inputCoordX.value);
	const coord_y = parseInt(dom.inputCoordY.value);
	const rasterTileUrl = dom.selectTile.value;
	console.log(rasterTileUrl);

	scene = initializeScene();
	createPolygon(rasterTileUrl, {
		zoomLevel: zoomLevel,
		coord_x: coord_x,
		coord_y: coord_y
	}, scene);
});

document.getElementById("previewButton").addEventListener("click", () => {
	const zoomLevel = parseInt(dom.inputZoomLevel.value);
	const coord_x = parseInt(dom.inputCoordX.value);
	const coord_y = parseInt(dom.inputCoordY.value);

	const url = `https://cyberjapandata.gsi.go.jp/xyz/lndst/${zoomLevel}/${coord_x}/${coord_y}.png`;
	dom.imgRasterTile.src = url;
})