function Site () {
    this.init();
}
Site.prototype = {
    $matrixTable: null,
    $matrixPaths: null,
    $matrixSources: null,
    $matrixPurchasers: null,
    $matrixSums: null,
    $matrixSourcesSum: null,
    $matrixPurchasersSum: null,
    $result: null,
    $navigation: null,
    $buttonReset: null,
    $buttonEdit: null,
    $buttonCalculate: null,
    $numberSources: null,
    $numberPurchasers: null,
    $lookFor: null,
    init: function () {
        var context = this;

        this.$matrixTable = $( '#matrix-table' );
        this.$buttonReset = $( '#button-reset' );
        this.$buttonEdit = $( '#button-edit' );
        this.$buttonCalculate = $( '#button-calculate' );
        this.$numberSources = $( '#numberSources' );
        this.$numberPurchasers = $( '#numberPurchasers' );
        this.$result = $( '#result' );
        this.$navigation = $( '#navigation' );
        this.$lookFor = $( '#look-for' );

        this.initBindings();

        this.generateTableContent();

//        this.$matrixTable.find( 'input' )
//            .val( 10 )
    },
    initBindings: function () {
        var context = this;

        // Create spinners
        this.$numberSources
            .add( this.$numberPurchasers )
            .spinner( {
            min: 2,
            max: 100,
            change: function ( e ) {
                var $this = $( this );
                var max = $this.spinner( 'option', 'max' );
                if ( this.value > max ) {
                    this.value = max;
                }
                context.generateTableContent();
            }
        } )
            .keydown( this.handlerValidationKeydown );

//        this.$lookFor.buttonset( {
//            create: function ( e ) {
//                $( this )
//                    .show();
//            }
//        } )
//            .find( 'input' )
//            .on( 'change', function ( e ) {
//            window.console.log( context.$lookFor.find('input:checked').val() );
//        } );

        this.$buttonCalculate.on( 'click', function ( e ) {
            $( this )
                .data( 'lastClicked', now() );

            var inputs = context.$matrixTable.find( 'input' );
            var emptyInputs = inputs.filter( function () {
                return this.value === '';
            } );
            if ( emptyInputs.length > 0 ) {
                context._showDialog( 'Ташаци',
                    'Не сте попълнили всички поленца, ваш`та мама!',
                    function ( e ) {
                        emptyInputs.addClass( 'element-error' );
                    },
                    function ( e ) {
                        setTimeout( function () {
                            emptyInputs.removeClass( 'element-error' );
                        }, 3000 );
                    } );
                return false;
            }

            // If sum of purchasers and sources are not equal, error
            if ( context.$matrixPurchasersSum.text() !== context.$matrixSourcesSum.text() ) {
                context._showDialog( 'Ташаци',
                    'Сбора на източниците и консуматорите не съответства, ваш`та мама!',
                    function ( e ) {
                        context.$matrixSums.addClass( 'element-error' );
                    },
                    function ( e ) {
                        setTimeout( function () {
                            context.$matrixSums.removeClass( 'element-error' );
                        }, 3000 );
                    } );
                return false;
            }

            inputs.prop( 'disabled', true );
            context.$matrixSums.addClass( 'disabled' );
            context.$numberSources.spinner( 'disable' );
            context.$numberPurchasers.spinner( 'disable' );
//            context.$lookFor.buttonset( 'disable' );
            context.$result.empty()
                .parent()
                .show();
            context.$navigation.empty()
                .parent()
                .show();

            context.doCalculations( );
        } );

        this.$buttonReset
            .add( this.$buttonEdit )
            .on( 'click', function ( e ) {
            var inputs = context.$matrixTable.find( 'input' );
            if ( $( this )
                .is( context.$buttonReset ) ) {
                inputs.val( '' );
                context.$matrixPurchasersSum
                    .add(context.$matrixSourcesSum)
                    .html(0);
            }

            inputs.prop( 'disabled', false );
            context.$matrixSums.removeClass( 'disabled' );
            context.$numberSources.spinner( 'enable' );
            context.$numberPurchasers.spinner( 'enable' );
//            context.$lookFor.buttonset( 'enable' );
            context.$result.empty()
                .parent()
                .hide();
            context.$navigation.empty()
                .parent()
                .hide();
        } );

        this.$matrixTable.on( 'keydown', 'input', this.handlerValidationKeydown );

        this.$matrixTable.on( 'change', 'input.source', function ( e ) {
            var sum = 0;
            context.$matrixSources.each( function () {
                if ( this.value !== '' && !isNaN( this.value ) ) {
                    sum += parseInt( this.value );
                }
            } );
            context.$matrixSourcesSum.text( sum );
        } );
        this.$matrixTable.on( 'change', 'input.purchaser', function ( e ) {
            var sum = 0;
            context.$matrixPurchasers.each( function () {
                if ( this.value !== '' && !isNaN( this.value ) ) {
                    sum += parseInt( this.value );
                }
            } );
            context.$matrixPurchasersSum.text( sum );
        } );
    },
    doCalculations: function ( ) {
        var context = this;
        var sources = this._extractSourcesToArray();
        var purchasers = this._extractPurchasersToArray();
        var matrix = new Matrix( sources, purchasers );

        this._extractPathsToMatrix( matrix );

//
//        var matrix = new Matrix( [110, 110, 80], [50, 90, 90, 70] );
//
//        matrix.setMatrix( [
//            [17, 28, 5, 3],
//            [2, 1, 25, 15],
//            [16, 3, 1, 12]
//        ] );
//
//        var matrix = new Matrix( [9000, 4000, 8000], [3000, 5000, 4000, 6000, 3000] );
//
//        matrix.setMatrix( [
//            [10, 20, 5, 9, 10],
//            [2, 10, 8, 30, 6],
//            [1, 20, 7, 10, 4]
//        ] );

//        var matrix = new Matrix( [30, 20, 10], [18, 22, 20] );
//
//        matrix.setMatrix( [
//            [3, 1, 8],
//            [2, 5, 4],
//            [0, 0, 0]
//        ] );
//        var matrix = new Matrix( [30, 20, 10], [18, 22, 20] );
//
//        matrix.setMatrix( [
//            [456, 123, 56],
//            [9815, 3165, 489],
//            [23, 156, 987]
//        ] );

        if ( matrix.solve() === true ) {
            var loadedMatrixes = matrix.getLoadedMatrixes();

            this.$result
                .append( this._buildTitle( 'Последователност на товарене' ) )
                .append( this._buildMatrixQueue( matrix ) );


            for (var k = 0; k < loadedMatrixes.length - 1; k++) {
                var lm = loadedMatrixes[k];
                this.$result
                    .append( this._buildTitle( 'Натоварена матрица №', k + 1 ) )
                    .append( this._buildTable( lm.loadedMatrix, 0, 0 ) )
                    .append( this._buildTitle( 'Цикли на матрица №', k + 1 ) )
                    .append( this._buildLoops( lm.positiveLoopIndex, lm.loops, matrix ) )
                    .append( this._buildTitle( 'Z<sub>min</sub> на матрица №', k + 1 ) )
                    .append( this._buildZMin( lm.zMin, lm.loadedMatrix, matrix ) )
                    .append( this._buildTitle( '&#952;<sub>min</sub> на матрица №', k + 1 ) )
                    .append( this._buildThetaMin( lm.thetaMinIndex, lm.loops[lm.positiveLoopIndex].elements ) );
            }

            var lmf = loadedMatrixes[loadedMatrixes.length - 1];
            var result = (loadedMatrixes.length > 1)
                ? this._buildZFinal( lm.zMin, lm.thetaMinIndex, lm.loops[lm.positiveLoopIndex], matrix )
                : this._buildZMin( lmf.zMin, lmf.loadedMatrix, matrix );

            this.$result
                .append( this._buildTitle( 'Натоварена матрица №', loadedMatrixes.length ) )
                .append( this._buildTable( lmf.loadedMatrix, 0, 0 ) )
                .append( this._buildTitle( 'Цикли на матрица №', loadedMatrixes.length ) )
                .append( this._buildLoops( lmf.positiveLoopIndex, lmf.loops, matrix ) )
                .append( this._buildTitle( 'Z<sub>0</sub> на задачата' ) )
                .append( result )
                .append( this._buildTitle( 'Лог на програмата' ) )
                .append( this._buildLog( ) );
        } else {
            this._showDialog( 'Ташаци, ташаци',
                'Алгоритъма изведе вътрешна грешка поради некоректни данни, ваш`та мама!',
                null,
                function ( e ) {
                    context.$buttonEdit.click();
                } );
        }
    },
    _buildMatrixQueue: function ( matrix ) {
        var queue = matrix.getQueue();
        var queueMatrix = [];

        for (var i = 0; i < matrix.getSources().length; i++) {
            queueMatrix[i] = [];
        }
        for (var k = 0; k < queue.length; k++) {
            queueMatrix[queue[k].i][queue[k].j] = romanize( k + 1 );
        }

        return this._buildTable( queueMatrix, matrix.getSources(), matrix.getPurchasers(), true );
    },
    _buildTable: function ( matrix, sources, purchasers, calculateSum ) {
        var html = '';
        var sourcesIsArray = $.isArray( sources );
        var purchasersIsArray = $.isArray( purchasers );
        var sumSources = 0;
        var sumPurchasers = 0;

        html += '<div class="well well-large matrix-holder">';
        html += '<div class="matrix-container">';
        html += '<div class="matrix-brackets">';

        html += '<table>';

        for (var i = 0; i < matrix.length; i++) {
            html += '<tr>';

            for (var j = 0; j < matrix[i].length; j++) {
                html += '<td>';
                html += '<span class="imitate-input disabled">';
                html += matrix[i][j];
                html += '</span>';
                html += '</td>';
            }

            html += '<td>';
            html += '<span class="imitate-input source disabled">';
            html += (sourcesIsArray) ? sources[i] : sources;
            html += '</span>';
            html += '</td>';

            if ( calculateSum ) {
                sumSources += (sourcesIsArray) ? sources[i] : sources;
            }

            html += '</tr>';
        }

        html += '<tr>';

        for (var j = 0; j < matrix[0].length; j++) {
            html += '<td>';
            html += '<span class="imitate-input purchaser disabled">';
            html += (purchasersIsArray) ? purchasers[j] : purchasers;
            html += '</span>';
            html += '</td>';

            if ( calculateSum ) {
                sumPurchasers += (purchasersIsArray) ? purchasers[j] : purchasers;
            }
        }

        html += '<td>';
        html += '<span class="sums imitate-input disabled">';
        html += '<sub id="sum-purchasers">';
        html += sumPurchasers;
        html += '</sub>';
        html += '\\';
        html += '<sup id="sum-sources">';
        html += sumSources;
        html += '</sup>';
        html += '</span>';
        html += '</td>';
        html += '</tr>';

        html += '</table>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        return html;
    },
    _buildLoops: function ( highlightedIndex, loops, matrix ) {
        var html = '';

        html += '<pre>';
        html += '<ul class="unstyled">';

        for (var k = 0; k < loops.length; k++) {
            var strSecondLine = '';

            html += (k === highlightedIndex || loops[k].elements.length === 0) ? '<li style="color: red">' : '<li>';

            html += this.toUnicodeSubscript( '&#0948;&#8333;', loops[k].i + 1, ',', loops[k].j + 1, '&#8334; = ' );

            for (var l = 0; l < loops[k].elements.length; l++) {
                var sign = (l % 2 !== 0) ? ' + ' : ' - ';

                html += this.toUnicodeSubscript( sign, 'c&#8333;', loops[k].elements[l].i + 1, ',', loops[k].elements[l].j + 1, '&#8334;' );

                strSecondLine += sign + matrix.getValue( loops[k].elements[l].i, loops[k].elements[l].j );
            }
            // If the loop isn't empty
            if (l > 0) {
                html += ' = ';
                html += strSecondLine;
                html += ' = ';
                html += loops[k].value;
            } else {
                html += loops[k].value;
                html += ' (Не е открит цикъл)';
            }
            html += '</li>';
        }

        html += '</ul>';
        html += '</pre>';

        return html;
    },
    _buildTitle: function () {
        var content = '';
        var index = this.$navigation.find( 'li' ).length;

        for (var k = 0; k < arguments.length; k++) {
            content += arguments[k];
        }

        this.$navigation.append( '<li><a href="#navigate-' + index + '">' + content + '</a></li>' );

        return '<h3 id="navigate-' + index + '">' + content + '</h3>';
    },
    _buildZMin: function ( zMin, loadedMatrix, matrix ) {
        var html = '';

        html += '<pre>';
        html += 'Z';
        html += '<sub>';
        html += 'min';
        html += '</sub>';
        html += ' = ';

        for (var i = 0; i < loadedMatrix.length; i++) {
            for (var j = 0; j < loadedMatrix[i].length; j++) {
                if ( loadedMatrix[i][j] !== 0 ) {
                    html += loadedMatrix[i][j];
                    html += ' x ';
                    html += matrix.getValue( i, j );
                    html += ' + ';
                }
            }
        }
        html = html.substr( 0, html.length - 3 );

        html += ' = ';
        html += zMin;
        html += '</pre>';
        return html;
    },
    _buildThetaMin: function ( thetaMinIndex, elements ) {
        var html = '';

        html += '<pre>';
        html += '&#952;';
        html += '<sub>';
        html += 'min';
        html += '</sub>';
        html += ' = ';
        html += '{ ';

        for (var k = 1; k < elements.length; k += 2) {
            html += elements[k].value;
            html += '; ';
        }

        html = html.substr( 0, html.length - 3 );

        html += ' }';
        html += ' = ';
        html += elements[thetaMinIndex].value;
        html += '</pre>';
        return html;
    },
    _buildZFinal: function ( zMin, thetaMinIndex, loop, matrix ) {
        var html = '';
        html += '<pre>';
        html += 'Z';
        html += '<sub>';
        html += '0';
        html += '</sub>';
        html += ' = ';
        html += 'Z';
        html += '<sub>';
        html += 'min';
        html += '</sub>';
        html += ' - ';
        html += '&#952;';
        html += ' x ';
        html += this.toUnicodeSubscript( '&#0948;&#8333;', loop.i, ',', loop.j, '&#8334;' );
        html += ' = ';
        html += zMin;
        html += ' - ';
        html += loop.elements[thetaMinIndex].value;
        html += ' x ';
        html += loop.value;
        html += ' = ';
        html += matrix.getResult();
        html += '</pre>';
        return html;
    },
    _buildLog: function ( ) {
        var html = '';
        html += '<pre>';
        html += 'Сметките се извършиха за ';
        html += now() - this.$buttonCalculate.data( 'lastClicked' );
        html += ' милисекунди.';
        html += '</pre>';
        return html;
    },
    _extractSourcesToArray: function () {
        var sources = [];
        this.$matrixSources.each( function ( k ) {
            sources.push( parseInt( this.value ) );
        } );
        return sources;
    },
    _extractPurchasersToArray: function () {
        var purchasers = [];
        this.$matrixPurchasers.each( function ( k ) {
            purchasers.push( parseInt( this.value ) );
        } );
        return purchasers;
    },
    _extractPathsToMatrix: function ( matrix ) {
        this.$matrixPaths.each( function ( k ) {
            matrix.setValue( parseInt( this.getAttribute( 'data-i' ) ),
                parseInt( this.getAttribute( 'data-j' ) ),
                parseInt( this.value ) );
        } );
    },
    _showDialog: function ( title, content, open, close ) {
        if ( !this.$dialog ) {
            this.$dialog = $( '<div></div>' );
        }
        this.$dialog.dialog( {
            modal: true,
            show: true,
            title: title,
            open: open,
            close: close
        } )
            .html( content );
    },
    /**
     * Validate only integer values
     * @param {Object} e
     * @returns {undefined}
     */
    handlerValidationKeydown: function ( e ) {
        // Allow: backspace, delete, tab, escape, enter and F5
        if ( e.keyCode === 46 || e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 27 || e.keyCode === 13 || e.keyCode === 116
            // Allow: Ctrl+A
            || (e.keyCode === 65 && e.ctrlKey === true)
            // Allow: home, end, left, right
            || (e.keyCode >= 35 && e.keyCode <= 39)
            ) {
            return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if ( e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105) ) {
                e.preventDefault();
            }
        }
    },
    /**
     * Generates table of inputs
     * @returns {undefined}
     */
    generateTableContent: function () {
        var tableContent = '';
        var m = parseInt( this.$numberSources.val() );
        var n = parseInt( this.$numberPurchasers.val() );
        var tabIndex = 2 + m + n;
        for (var i = 0; i < m; i++) {
            tableContent += '<tr>';
            for (var j = 0; j < n; j++) {
                tableContent += '<td>';
                tableContent += '<input type="text" class="path" data-i="' + i + '" data-j="' + j + '" placeholder="' + this.toUnicodeSubscript( 'c&#8333;', i + 1, ',', j + 1, '&#8334;' ) + '" tabindex="' + (++tabIndex) + '" />';
                tableContent += '</td>';
            }
            tableContent += '<td class="source">';
            tableContent += '<input type="text" class="source" data-i="' + i + '" placeholder="' + this.toUnicodeSubscript( 'a', i + 1 ) + '" tabindex="' + (3 + i) + '" />';
            tableContent += '</td>';
            tableContent += '</tr>';
        }
        tableContent += '<tr>';
        for (var j = 0; j < n; j++) {
            tableContent += '<td>';
            tableContent += '<input type="text" class="purchaser" data-j="' + j + '" placeholder="' + this.toUnicodeSubscript( 'b', j + 1 ) + '" tabindex="' + (3 + m + j) + '" />';
            tableContent += '</td>';
        }
        tableContent += '<td><span class="sums imitate-input"><sub id="sum-purchasers">0</sub>\\<sup id="sum-sources">0</sup></span></td>';
        tableContent += '</tr>';

        this.$matrixTable
            .html( tableContent );

        this.$matrixPaths = this.$matrixTable.find( 'input.path' );
        this.$matrixSources = this.$matrixTable.find( 'input.source' );
        this.$matrixPurchasers = this.$matrixTable.find( 'input.purchaser' );
        this.$matrixSums = this.$matrixTable.find( 'span.sums' );
        this.$matrixSourcesSum = $( '#sum-sources' );
        this.$matrixPurchasersSum = $( '#sum-purchasers' );

        this.$matrixSources.first()
            .focus();
    },
    /**
     * Generates unicode subscript of numeric values
     * @returns {String}
     */
    toUnicodeSubscript: function () {
        var result = '';

        for (var k in arguments) {
            if ( isNaN( arguments[k] ) ) {
                result += arguments[k];
            } else {
                var str = arguments[k].toString();

                for (var l in str) {
                    result += '&#832' + str[l] + ';';
                }
            }
        }
        return result;
    }
};

$( function () {
    var siteInstance = new Site();
} );


function cantorPairing ( k1, k2 ) {
    return 1 / 2 * (k1 + k2) * (k1 + k2 + 1) + k2;
}
Array.prototype.clone = function ( recursive ) {
    var arr = this.slice( 0 );
    if ( recursive ) {
        for (var k = 0; k < this.length; k++) {
            if ( arr[k].clone ) {
                arr[k] = this[k].clone( true );
            }
        }
    }
    return arr;
};
function romanize ( num ) {
    var lookup = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
    },
    roman = '',
        i;
    for (i in lookup) {
        while ( num >= lookup[i] ) {
            roman += i;
            num -= lookup[i];
        }
    }
    return roman;
}
var now = (function () {
    var perf = window.performance || {
    };
    var fn = perf.now || perf.mozNow || perf.webkitNow || perf.msNow || perf.oNow;
// fn.bind will be available in all the browsers that support the advanced window.performance... ;-)
    return fn ? fn.bind( perf ) : function () {
        return new Date().getTime();
    };
})();
