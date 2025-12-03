import Vector from '../classes/Vector';
import type RunPoint from '../types/RunPoint';
import distanceOfLine from './distanceCalculator';
import formatRouteToAMap from './formatRouteToAMap';
import normalRandom from './normalRandom';

type Point = [number, number];

const std = 1 / 50000;

/** 输入一个预期距离，返回一个模拟路线
 * @param {string} distance
 */
const generateRoute = (distance: string, taskToday: RunPoint) => {
  /** 输入一个点，返回加偏后的点 */
  const addDeviation = (point: Point): Point =>
    point.map((plot) => normalRandom(plot, std)) as Point;

  /**
   * 输入两个路径点数组A、B，返回A加上A与B之间的9个点，不返回B
   * @param {[number,number]} pointA
   * @param {[number,number]} pointB
   */
  const addPoints = (pointA: Point, pointB: Point) => {
    const stepLength = 0.0001;
    const stepLengthnum = Number(stepLength);
    const pointVector = new Vector([pointB[0] - pointA[0], pointB[1] - pointA[1]]);
    const numberOfPoints = Math.floor(pointVector.norm / Number(stepLength));
    const points = [pointA];
    for (let i = 1; i < numberOfPoints; i += 1) {
      const pointX = pointA[0] + i * stepLengthnum * pointVector.unitVector[0];
      const pointY = pointA[1] + i * stepLengthnum * pointVector.unitVector[1];
      points.push([pointX, pointY]);
    }
    return points;
  };

  /** 为自由跑生成随机闭合路线 */
  const generateFreeRunRoute = (): Point[] => {
    // 使用固定中心点或随机中心点
    const center: Point = [116.397428, 39.90923]; // 默认中心点（北京）
    const radius = 0.01; // 约1公里范围
    
    // 生成10-15个随机点，形成一个闭合区域
    const pointsCount = 10 + Math.floor(Math.random() * 6);
    const points: Point[] = [];
    
    for (let i = 0; i < pointsCount; i++) {
      const angle = (i / pointsCount) * 2 * Math.PI;
      const randomRadius = radius * Math.random();
      const point: Point = [
        center[0] + randomRadius * Math.cos(angle),
        center[1] + randomRadius * Math.sin(angle)
      ];
      points.push(point);
    }
    
    // 闭合路线
    points.push(points[0]);
    
    // 添加点之间的中间点
    const combinedPoints: Point[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const pointA = points[i];
      const pointB = points[i + 1];
      const segmentPoints = addPoints(pointA, pointB);
      combinedPoints.push(...segmentPoints);
    }
    
    return combinedPoints;
  };

  /** 输入一个标准路径数组，返回添加完路径点后的标准路径 */
  const combinePoints = (): Point[] => {
    // 自由跑模式
    if (taskToday.pointId === 'free_run') {
      return generateFreeRunRoute();
    }
    
    // 普通路线模式
    const { pointList } = taskToday;
    if (!pointList[0]?.latitude) throw new Error('任务为空');
    const route = formatRouteToAMap(pointList);
    const combinedPoints = [];
    for (let index = 0; index < route.length; index += 1) {
      if (index === route.length - 1) {
        combinedPoints.push(route[index]);
        break;
      }
      const pointA = route[index];
      const pointB = route[index + 1];
      addPoints(pointA, pointB).forEach((points) => {
        combinedPoints.push(points);
      });
    }
    return combinedPoints;
  };

  /**
   * @param {number[][]} route
   */
  const trimRoute = (route: Point[]) => {
    let r = 0;
    const oriI = Math.floor(Math.random() * route.length);
    let i = oriI;
    const points = [addDeviation(route[oriI])];
    const distanceM = Number(distance) * 1000;
    while (r < distanceM) {
      const point = addDeviation(route[i]);
      points.push(point);
      r = distanceOfLine(points);
      i += 1;
      // 不计算最后两个路径点避免标准路线抽风导致的路线抽风
      if (i >= route.length - 2) {
        i = 0;
      }
    }
    return { points, distance: r };
  };
  const routeAddedPoints = combinePoints();
  const trimedRoute = trimRoute(routeAddedPoints);
  return {
    mockRoute: trimedRoute.points.map((xy) => ({
      longitude: xy[0].toFixed(6),
      latitude: xy[1].toFixed(6),
    })),
    distance: (trimedRoute.distance / 1000).toFixed(2),
  };
};

export default generateRoute;
