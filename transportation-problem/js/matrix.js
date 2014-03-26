/**
 * New matrix object
 * @public 
 * @param {Array} sources
 * @param {Array} purchasers
 * @returns {Matrix}
 */
function Matrix ( sources, purchasers ) {
    /**
     * @field
     * @type Array
     */
    var _sources = sources;
    /**
     * @field
     * @type Array
     */
    var _purchasers = purchasers;
    /**
     * @field
     * @type Array
     */
    var _matrix = _generateMatrix( _sources.length, _purchasers.length );
    /**
     * @field
     * @type Array
     */
    var _queue = [];
    /**
     * @field
     * @type Array
     */
    var _loadedMatrixes = [];
    /**
     * @field
     * @type Number
     */
    var _result;

    /**
     * Generates empty matrix
     * @private
     * @param {Number} m rows
     * @param {Number} n columns
     * @param {Boolean} useZeros if true, fill with zeroes instead of nulls
     * @returns {Array}
     */
    function _generateMatrix ( m, n, useZeros ) {
        var value = useZeros ? 0 : null;
        var matrix = [];
        for (var i = 0; i < m; i++) {
            matrix[i] = [];
            for (var j = 0; j < n; j++) {
                matrix[i][j] = value;
            }
        }
        return matrix;
    }
    /**
     * Get queue of elements of the matrix sorted ascending by value
     * @private
     * @returns {Array}
     */
    function _getQueue () {
        // Previous checked minimum value
        var previousMin = -1;

        // Number of elements in the matrix
        var numberElements = _sources.length * _purchasers.length;

        while ( _queue.length < numberElements ) {
            // Min value assigns first element
            var min = {
                i: 0,
                j: 0,
                value: -1
            };
            var queueEqualValues = [];
            for (var i = 0; i < _sources.length; i++) {
                // Queue of elements in current matrix row
                var queueRow = [];
                for (var j = 0; j < _purchasers.length; j++) {
                    var value = _matrix[i][j];
                    // If value is greater than previously checked minimum value
                    if ( value > previousMin ) {
                        // If value is lower than previously found minimum value, update minimum value
                        if ( value < min.value || min.value < 0 ) {
                            // TODO review this code: gettings same queueEqualValues multiple times
                            min = {
                                i: i,
                                j: j,
                                value: value
                            };
                            queueEqualValues = [];
                            queueRow = [min];
                        }
                        // If value is equal to previously found minimum value, add value to the row's queue
                        else if ( value === min.value
                            && (queueEqualValues.length || queueRow.length)
                            ) {
                            queueRow.push( {
                                i: i,
                                j: j,
                                value: value
                            } );
                        }
                    }
                }

                // If there are multiple elements with same value in single row
                if ( queueRow.length > 1 ) {
                    queueRow = _sortQueueMembers( queueRow );
                }

                queueEqualValues = queueEqualValues.concat( queueRow );
            }

            previousMin = min.value;
            _queue = _queue.concat( queueEqualValues );
        }
        return true;
    }
    /**
     * Sort properly queue members from same row, from highest potencial to lowest
     * @param {Array} queue
     * @returns {Array}
     */
    function _sortQueueMembers ( queue ) {
        for (var k = 0; k < queue.length; k++) {
            var baseValue = _purchasers[queue[k].j];
            for (var l = k + 1; l < queue.length; l++) {
                if ( _purchasers[queue[l].j] > baseValue ) {
                    var tmp = queue[k].j;
                    queue[k].j = queue[l].j;
                    queue[l].j = tmp;
                }
            }
        }
        return queue;
    }
    /**
     * Load matrix
     * @returns {unresolved}
     */
    function _loadMatrix () {
        var sources = _sources.clone();
        var purchasers = _purchasers.clone();
        var queue = _queue.clone();
        var loadedMatrix = _generateMatrix( sources.length, purchasers.length, true );
        // While queue contains elements
        while ( queue.length > 0 ) {
            // Shift first element of the queue
            var element = queue.shift();
            // If the value of the source is bigger, then load with the full value of the purchaser
            if ( sources[element.i] >= purchasers[element.j] ) {
                loadedMatrix[element.i][element.j] = purchasers[element.j];
                sources[element.i] -= purchasers[element.j];
                purchasers[element.j] = 0;
            }
            // If the value of the purchaser is bigger, then load with the full value of the source
            else {
                loadedMatrix[element.i][element.j] = sources[element.i];
                purchasers[element.j] -= sources[element.i];
                sources[element.i] = 0;
            }
        }
        return loadedMatrix;
    }
    /**
     * Get loops from matrix
     * @param {Array} loadedMatrix
     * @returns {Array|Boolean}
     */
    function _findLoops ( loadedMatrix ) {
        var loops = [];
        var data = {
            hasBeenReloaded: false
        };
        var zMin = 0;
        var maxPositiveLoopValue = 0;

        for (var i = 0; i < _sources.length; i++) {
            for (var j = 0; j < _purchasers.length; j++) {
                // If elements is not loaded, find it's loop
                if ( loadedMatrix[i][j] === 0 ) {
                    var elements = _findLoopOfBase( loadedMatrix, i, j );
                    // Add it to other loops
                    if ( elements !== false ) {
                        var value = _getLoopValue( elements );
                        loops.push( {
                            elements: elements,
                            i: i,
                            j: j,
                            value: value
                        } );
                        if ( maxPositiveLoopValue < value ) {
                            maxPositiveLoopValue = value;

                            $.extend( data, _getLoopData( loadedMatrix, elements ) );
                            data.positiveLoopIndex = loops.length - 1;
                            data.hasBeenReloaded = true;
                        }
                    } else {
                        return false;
                    }
                } else {
                    zMin += loadedMatrix[i][j] * _matrix[i][j];
                }
            }
        }
        return {
            zMin: zMin,
            loops: loops,
            data: data
        };
    }
    /**
     * Find loop around given matrix and given element of the matrix
     * @param {Array} matrix
     * @param {Number} baseI
     * @param {Number} baseJ
     * @returns {@exp;stack@call;toArray|Boolean}
     */
    function _findLoopOfBase ( matrix, baseI, baseJ ) {
        var m = matrix.length;
        var n = matrix[0].length;

        /**
         * Stack object
         * @class Inline declaration of stack object
         * @return {Stack}
         */
        var stack = function () {
            // Stack container
            var stack = [];
            /**
             * Checks if id is already used 
             * @public
             * @param {Number} id
             * @returns {Boolean}
             */
            stack.containsId = function ( id ) {
                for (var k in stack) {
                    if ( stack[k].id === id ) {
                        return true;
                    }
                }
                return false;
            };
            /**
             * Adds to the end of the stack and generates unique id
             * @public
             * @param {Object} object
             * @returns {Void}
             */
            stack.push = function ( object ) {
                object.id = cantorPairing( object.i, object.j );
                stack[stack.length] = object;
            };
            /**
             * Converts stack to array
             * @public
             * @returns {Array}
             */
            stack.toArray = function () {
                var i = 0;
                var array = [];
                while ( typeof stack[i] !== 'undefined' ) {
                    array[i] = stack[i];
                    i++;
                }
                return array;
            };
            return stack;
        }();
        /**
         * Recursive function to find loop's edges
         * @param {Number} startI `i` coordinate of the start element
         * @param {Number} startJ `j` coordinate of the start element
         * @param {Boolean} searchVertical force it to search vertically or horizontally
         * @return {Boolean} True on success
         */
        function find ( startI, startJ, searchVertical ) {
            // Push the value to the stack
            stack.push( {
                i: startI,
                j: startJ,
                value: matrix[startI][startJ]
            } );
            // Search in vertical direction only if searchVertical is set to true or undefined
            if ( searchVertical === true || searchVertical !== false ) {
                // If we are at the same column as base value, we are ready
                if ( baseJ === startJ && baseI !== startI ) {
                    return true;
                }

                // Search to top
                for (var k = startI - 1; k >= 0; k--) {
                    // If matrix element is positive and isn't used alredy
                    if ( matrix[k][startJ] !== 0
                        && !stack.containsId( cantorPairing( k, startJ ) )
                        ) {
                        if ( find( k, startJ, false ) ) {
                            return true;
                        }
                    }
                }

                // Search to bottom
                for (var k = startI + 1; k < m; k++) {
                    // If matrix element is positive and isn't used alredy
                    if ( matrix[k][startJ] !== 0
                        && !stack.containsId( cantorPairing( k, startJ ) )
                        ) {
                        if ( find( k, startJ, false ) ) {
                            return true;
                        }
                    }
                }
            }

            // Search in horizontal direction only if searchVertical is set to false or undefined
            if ( searchVertical === false || typeof searchVertical === 'undefined' ) {
                // If we are at the same row as the starting value, we are ready
                if ( baseI === startI && baseJ !== startJ ) {
                    return true;
                }

                // Search to left
                for (var l = startJ - 1; l >= 0; l--) {
                    // If matrix element is positive and isn't used alredy
                    if ( matrix[startI][l] !== 0
                        && !stack.containsId( cantorPairing( startI, l ) )
                        ) {
                        if ( find( startI, l, true ) ) {
                            return true;
                        }
                    }
                }
                // Search to right
                for (var l = startJ + 1; l < n; l++) {
                    // If matrix element is positive and isn't used alredy
                    if ( matrix[startI][l] !== 0
                        && !stack.containsId( cantorPairing( startI, l ) )
                        ) {
                        if ( find( startI, l, true ) ) {
                            return true;
                        }
                    }
                }
            }

            // If no value is returned, pop the last value from stack and return false
            stack.pop();
            return false;
        }

        find( baseI, baseJ );
        return stack.toArray();
    }

    function _getLoopValue ( loop ) {
        var sum = 0;
        for (var k = 0; k < loop.length; k++) {
            sum += _matrix[loop[k].i][loop[k].j] * ((k % 2) ? 1 : -1);
        }
        return sum;
    }
    function _getLoopData ( loadedMatrix, elements ) {
        var thetaMin = 0;
        var thetaMinIndex = 0;
        var reloadedMatrix = loadedMatrix.clone( true );
        for (var k = 1; k < elements.length; k += 2) {
            if ( elements[k].value < thetaMin || thetaMin === 0 ) {
                thetaMin = elements[k].value;
                thetaMinIndex = k;
            }
        }

        for (var k = 0; k < elements.length; k++) {
            // Reload matrix
            reloadedMatrix[elements[k].i][elements[k].j] += thetaMin * ((k % 2 === 0) ? 1 : -1);
        }

        return {
            thetaMinIndex: thetaMinIndex,
            reloadedMatrix: reloadedMatrix
        };
    }

    /**
     * Get queue elements how matrix was first loaded
     * @public
     * @returns {Array}
     */
    this.getQueue = function () {
        return _queue;
    };
    /**
     * Get value of element
     * @public
     * @param {Number} i
     * @param {Number} j
     * @returns {Number}
     */
    this.getValue = function ( i, j ) {
        return _matrix[i][j];
    };
    /**
     * Get result of matrix
     * @public
     * @returns {Number}
     */
    this.getResult = function () {
        return _result;
    };
    /**
     * @returns {Array}
     */
    this.getSources = function () {
        return _sources;
    };
    /**
     * @returns {Array}
     */
    this.getPurchasers = function ( ) {
        return _purchasers;
    };
    /**
     * Set value to element
     * @public
     * @param {Numeric} i
     * @param {Numeric} j
     * @param {Numeric} value
     * @returns {undefined}
     */
    this.setValue = function ( i, j, value ) {
        _matrix[i][j] = value;
    };
    /**
     * Get array of loaded matrixes
     * @public
     * @returns {unresolved}
     */
    this.getLoadedMatrixes = function () {
        return _loadedMatrixes;
    };
    /**
     * Solves the matrix, true on success
     * @public
     * @returns {Boolean}
     */
    this.solve = function () {
        _getQueue();

        var loadedMatrix = _loadMatrix();

        do {
            var loopsOfLoadedMatrix = _findLoops( loadedMatrix );

            if ( loopsOfLoadedMatrix !== false ) {
                var loadedMatrixData = $.extend( {
                    loadedMatrix: loadedMatrix,
                    loops: loopsOfLoadedMatrix.loops,
                    zMin: loopsOfLoadedMatrix.zMin
                },
                loopsOfLoadedMatrix.data );
                _loadedMatrixes.push( loadedMatrixData );
            } else {
                return false;
            }

            loadedMatrix = loadedMatrixData.reloadedMatrix;
        } while ( _loadedMatrixes[_loadedMatrixes.length - 1].hasBeenReloaded )

        // Last-but-one loaded matrix
        if ( _loadedMatrixes.length > 1 ) {
            var lastButOne = _loadedMatrixes[_loadedMatrixes.length - 2];
            var lastButOnePositiveLoop = lastButOne.loops[lastButOne.positiveLoopIndex];
            _result = lastButOne.zMin - lastButOnePositiveLoop.value * lastButOnePositiveLoop.elements[lastButOne.thetaMinIndex].value;
        } else {
            _result = _loadedMatrixes[_loadedMatrixes.length - 1].zMin;
        }

        return true;
    };

    /**
     * @deprecated TODO Delete this
     * @param {type} matrix
     * @returns {undefined}
     */
    this.setMatrix = function ( matrix ) {
        _matrix = matrix;
    };
}
