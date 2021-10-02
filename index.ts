import { find, Eventify } from 'cc';

let socket;

class EventZGame {}
class InnerEventCenter extends Eventify(EventZGame) {
    static __http_event_prefix__: string  = '__http_event_prefix__';
    get(eventName: string, url: string, responseType?: XMLHttpRequestResponseType): void{
        const that = this;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        if(responseType){
            xhr.responseType = responseType;
        }
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) {
                that.emit(InnerEventCenter.__http_event_prefix__ + eventName, xhr.response);
            }
        }
        xhr.send();
    }

    post(eventName: string, url: string, body?: any, responseType?: XMLHttpRequestResponseType): void{
        const that = this;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        if(responseType){
            xhr.responseType = responseType;
        }
        if(body){
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) {
                that.emit(InnerEventCenter.__http_event_prefix__ + eventName, xhr.response);
            }
        }
        xhr.send(body);
    }
}
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

// on http event
function http(eventName: string) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        eventCenter.on(InnerEventCenter.__http_event_prefix__ + eventName, function (e) {
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

export { ConfigSocketIO, view, model, ws, http, socket, event, eventCenter, ioConnect};