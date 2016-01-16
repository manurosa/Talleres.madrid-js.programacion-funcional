// High Order II. Partial Evaluation [30 min]


// 01. Varios problemas en 1. 
//
// Problema 1. En un sistema de e-commerce disponemos de un
// carrito de la compra en la variable basket. Cada producto 
// indica su tipo (type - F: Food, H: Home), el numero de
// unidades (units) y el precio por unidad (price). Diseñar
// las funciones [food] y [home] que devuelven la colección de 
// artículos tipo F y H respectivamente, [any] que devuelve 
// la colección entera sin filtrar por tipo, [costF] que calcula
// el coste total de alimentos, [costH] el coste total de
// productos de hogar y [cost] el coste total de todo el carrito.
//
// Problema 2. Disponemos de una colección de datos de usuarios.
// en la variable users. De cada usuario se conoce su genero 
// (gender - M: Male F: Female) y su edad (age). Calcular la
// función [male] y [female] para filtrar por hombres y mujeres
// respectivamente, [both] para devolver la colección entera sin 
// filtrar, [meanM] que devuelve la edad media de hombres, [meanF]
// que hace lo mismo para el conjunto de los hombre y [mean] que 
// calcula la media de edad sin distinguir entre hombre y mujeres.

// Problema 3. A parte de las funciones que se piden en los enunciados 
// anteriores, ¿has diseñado varias funciones auxiliares para resolver
// sendos problemas? ¿son distintos? Si es así refactoriza hasta resolver
// ambos problemas con una misma función general.

(function (/* 01. zip */){
    
    var reduce = function (v, fn, b) {
        return (function reduceAux (v, fn, p, ac) {
            return p > v.length - 1 ?
                ac :
                reduceAux (v, fn, p+1, fn (ac, v[p], p, v));
        })(v, fn, 0, b);
    };
    var filter = function (v, pn) {
        return reduce (v, function (ac, e, i, v) {
            return pn (e, i, v) ? ac.concat (e) : ac;
        }, []);
    };
    
    var zip = function (pn, rn, b) {
        return function (v) {
            return reduce (filter (v, pn), rn, b);
        };
    };
    
    var basket = [
        { type: 'F', units: 3, price: 500 },
        { type: 'F', units: 2, price: 750 },
        { type: 'H', units: 1, price: 250 },
        { type: 'F', units: 1, price: 320 },
        { type: 'H', units: 1, price: 100 },
    ];
    var withType = function (type) {
        return function (e) { return type ? e.type === type : true; };
    };
    var food  = withType ('F');
    var home  = withType ('H');
    var any   = withType ();
    var add   = function (ac, e) { return ac + e.units * e.price; };
    var costF = zip (food, add, 0);
    var costH = zip (home, add, 0);
    var cost  = zip (any, add, 0);
    
    var users = [
        { gender: 'F', age: 32},
        { gender: 'F', age: 26},
        { gender: 'M', age: 28},
        { gender: 'F', age: 16},
        { gender: 'M', age: 46},
    ];
    var withGender = function (gender) {
        return function (e) { return gender ? e.gender === gender : true; };
    };
    var male   = withGender ('M');
    var female = withGender ('F');
    var both   = withGender ();
    var aggr   = function (ac, e, i) {
        return { 
            age: Math.trunc ((ac.total + e.age) / (i+1)), 
            total: ac.total + e.age
        };
    };
    var meanM = zip (male, aggr, {age: 0, total: 0});
    var meanF = zip (female, aggr, {age: 0, total: 0});
    var mean  = zip (both, aggr, {age: 0, total: 0});
    
    console.log (
        food (basket[0]),   // true 
        food (basket[2]),   // false 
        home (basket[0]),   // false
        home (basket[2]),   // true 
        costF (basket),     // 3320 
        costH (basket),     // 350 
        cost (basket)       // 3670
    );
    console.log (
        meanM (users),      // { age: 37, total: 74 } 
        meanF (users),      // { age: 24, total: 74 } 
        mean (users)        // { age: 29, total: 148 }
    );
    
})();


// 02. Dado un objeto, diseña una función [get] que, evaluada parcialmente,
// reciba un objeto o y después una clave k, y retorne el valor de k
// dentro de o. Después, diseña la función [pluck], que también en evaluación
// parcial, reciba primero un vector de objetos v y después una clave k. [Pluck] 
// debe devolver la colección de valores en cada una de las claves k que aparecen
// dentro de todos los objetos de v. 

(function (/* 02. get & pluck */){
    
    var reduce = function (v, fn, b) {
        return (function reduceAux (v, fn, p, ac) {
            return p > v.length - 1 ?
                ac :
                reduceAux (v, fn, p+1, fn (ac, v[p], p, v));
        })(v, fn, 0, b);
    };
    var map = function (v, fn) {
        return reduce (v, function (ac, e, i, v) {
            return ac.concat (fn (e, i, v));
        }, []);
    };
    
    var get = function (k) {
        return function (e) {
            return e[k];
        };
    };
    var pluck = function (k) {
        return function (v) {
            return map (v, get(k));
        };
    };
    var basket = [
        { type: 'F', units: 3, price: 500 },
        { type: 'F', units: 2, price: 750 },
        { type: 'H', units: 1, price: 250 },
        { type: 'F', units: 1, price: 320 },
        { type: 'H', units: 1, price: 100 },
    ];
    var types = pluck ('type');
    var units = pluck ('units');
    var prices = pluck ('price');
    
    console.log (
        types (basket),     // [ 'F', 'F', 'H', 'F', 'H' ] 
        units (basket),     // [ 3, 2, 1, 1, 1 ] 
        prices (basket)     // [ 500, 750, 250, 320, 100 ]
    );
})();


// 03. Diseña las funciones [first] y [last] que reciben una función fn como
// primer parámetro y un conjunto indefinido de otros n parámetros. [First] 
// debe devolver otra función resultado de evaluar fn en sus n primeros parámetros.
// [Last] hace lo mismo pero la función devuelta es el resultado de evaluar fn en sus 
// n últimos parámetros. 

(function (/* 03. first & last */){
    
    var first = function () {
        var fn = arguments[0];
        var params = [].slice.call (arguments, 1);
        return function () {
            var args = [].slice.call (arguments);
            return fn.apply (null, params.concat (args));
        };
    };
    
    var last = function () {
        var fn = arguments[0];
        var params = [].slice.call (arguments, 1);
        return function () {
            var args = [].slice.call (arguments);
            return fn.apply (null, args.concat (params));
        };
    };
    
    var ip = function (a, b, c, d) { return [a, b, c, d]; };
    var ipLocal = first (ip, 192, 168);
    var ipGate  = last (ip, 1, 1);
    
    console.log (
        ipLocal (12, 45),   // [ 192, 168, 12, 45 ]
        ipLocal (23, 76),   // [ 192, 168, 23, 76 ]
        ipGate (15, 29)     // [ 15, 29, 1, 1 ]
    );
    
})();

// 04. Diseña la función [partial] que recibe una función fn y un número entero n
// como parámetros. El resultado de evaluar [partial] genera una nueva función que
// invoca la función fn pasándole sólo sus n primeros parámetros.

(function (/* 04. partial */){
    
    var reduce = function (v, fn, b) {
        return (function reduceAux (v, fn, p, ac) {
            return p > v.length - 1 ?
                ac :
                reduceAux (v, fn, p+1, fn (ac, v[p], p, v));
        })(v, fn, 0, b);
    };
    var map = function (v, fn) {
        return reduce (v, function (ac, e, i, v) {
            return ac.concat (fn (e, i, v));
        }, []);
    };
    
    var partial = function (fn, n) {
        return function () {
            var args = [].slice.call (arguments, 0, n);
            return fn.apply (null, args);
        };
    }; 
    
    console.log (
        map (['1', '2', '3', '4'], parseInt),
        map (['1', '2', '3', '4'], function (e) { return parseInt (e) }),
        map (['1', '2', '3', '4'], partial (parseInt, 1))
    ); // [ 1, NaN, NaN, NaN ] [ 1, 2, 3, 4 ] [ 1, 2, 3, 4 ]
    
})();

// 05. Diseña la función [curry] que recibe una función fn y la transforma 
// en otra función evaluable parcialmente. El número de parámetros que pueden
// pasarse en cada invocación no debe estar en modo alguno limitado.

(function (/* 05. curry */){
    
    var curry = function (fn) {
        return function aux () { 
            var argsA = [].slice.call (arguments);
            return (argsA.length >= fn.length) ? 
                fn.apply (null, argsA) :
                function () { 
                    var argsB = [].slice.call (arguments);
                    return aux.apply (null,argsA.concat(argsB));
                };
        };
    };
    
    var add = function (x, y) { return x + y; };
    var mul = function (x, y) { return x * y; };
    var cadd = curry (add);
    var cmul = curry (mul);
    var inc    = cadd (1);
    var dec    = cadd (-1);
    var double = cmul (2);
    var triple = cmul (3);
    
    console.log (
        inc (3),        // 4
        dec (4),        // 3
        double (5),     // 10
        triple (6)      // 18
    );
    
})();