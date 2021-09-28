import { find, Eventify } from 'cc';

let socket;

class EventZGame {}
class InnerEventCenter extends Eventify(EventZGame) {}
const eventCenter = new InnerEventCenter();
const modelObjectMap = new Map();

// find view Component
function view(viewPath: string) : any {
    return  (target: any, propertyName: string) => {
        return {
            get: function () {
                return find(viewPath);
            }
        };
    }
}

// find model object singleton
function model(constructorFunction) : any {
    let modelObject = modelObjectMap.get(constructorFunction.name);
    if (modelObject === undefined) {
        const newConstructorFunction: any = function (...args) {
            const func: any = function () {
                return new constructorFunction(...args);
            };
            func.prototype = constructorFunction.prototype;
            return new func();
        };
        newConstructorFunction.prototype = constructorFunction.prototype;
        modelObject = newConstructorFunction();
        modelObjectMap.set(constructorFunction.name, modelObject);
    }

    return (target: any, propertyName: string) => {
        return {
            get: () => {
                return modelObject;
            }
        };
    }
}

// on inner event
function event(eventName: string) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        eventCenter.on(eventName, function (e) {
            target[propertyKey](e);
        });
    }
}

// on websocket event
function ws(eventName: string) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        socket.on(eventName, function (e) {
            target[propertyKey](e);
        });
    }
}

// for create socket io config
function ConfigSocketIO() : any {
    return (target: any, propertyName: string) => {
        socket = target[propertyName]();
    }
}

// socket.io wrapper
const ioConnect = function (...args) {
    // @ts-ignore
    return io.connect(...args);
}

export { ConfigSocketIO, view, model, ws, socket, event, eventCenter, ioConnect};