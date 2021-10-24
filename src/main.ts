import * as Babylon from 'babylonjs';
import parse from 'csv-parse/lib/sync';

const getDemTile = async (zoomLevel: number, x: number, y: number) => {
	// 地理院標高タイルにアクセス
	const url = `http://cyberjapandata.gsi.go.jp/xyz/dem/${zoomLevel}/${x}/${y}.txt`;
	const rawCsv = await fetch(url).then(response => response.text()).catch(error => {
		throw error;
	});
	const csv: number[][] = parse(rawCsv, {
		columns: false,
		delimiter: ','
	});
	return csv;
}

// キャンバスを取得
const canvas = document.getElementById("render3d");
// 3Dエンジンを読み込む
const engine = new Babylon.Engine(canvas as HTMLCanvasElement, true, {
	preserveDrawingBuffer: true,
	stencil: true
});

const createScene = (demTile: number[][]) => {
	// シーンを作成
	const scene = new Babylon.Scene(engine);
	// カメラを作成
	const camera = new Babylon.ArcRotateCamera("camera1", 0, Math.PI / 2.5, 3, new Babylon.Vector3(0, 250, -500), scene);
	camera.setTarget(Babylon.Vector3.Zero());
	camera.attachControl(canvas, false);
	// ライトを作成
	const light = new Babylon.HemisphericLight("light1", new Babylon.Vector3(1000, 1000, 0), scene);

	// ポリゴンを作成
	const dest = 3;
	for (let n = 0; n < 256; n = n + dest) {
		for (let m = 0; m < 256; m = m + dest) {
			const height = demTile[n][m] / 10;
			const column = Babylon.MeshBuilder.CreateBox(`column-${n}-${m}`, {
				size: dest,
				width: dest,
				height: height,
				sideOrientation: Babylon.Mesh.FRONTSIDE
			}, scene);
			column.position.x = n - 128;
			column.position.z = m - 128;
			column.position.y = height / 2;
		}
	}

	// グラウンドを作成
	const ground = Babylon.MeshBuilder.CreateGround("ground1", {
		width: 256,
		height: 256,
		subdivisions: 2,
		updatable: false
	}, scene);
	return scene;
}

getDemTile(11, 1809, 803).then(demTile => {
	const scene = createScene(demTile);
	engine.runRenderLoop(() => {
		scene.render();
	});
	window.addEventListener("resize", () => {
		engine.resize();
	});
});