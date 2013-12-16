var croppedImage;
var canvasStats;
var firstDrag = true;
var canvasEmpty = true;
var totalCount = 0;


function returnDataURL() {
    return window.croppedImage;
}

function isCanvasEmpty() {
    return window.canvasEmpty;
}

var myTangram = function () {

    var container_width = $('#tangram-container').width(),
		triangle_size = container_width / 4 - 1,
		board_width = container_width,
		board_height = container_width,
		piece_width = triangle_size,
		piece_height = triangle_size,
		column_width = triangle_size,
		column_height = triangle_size,

		rows = 4,
		cols = 4,
		gridSize = rows,

		grid = new Array(gridSize);
    for (var row = 0; row < gridSize; row++) {
        grid[row] = new Array(gridSize); // the columns
    }

    window.canvasStats = {
        totalHeight: triangle_size + 20 + container_width,
        toolbarHeight: triangle_size + 20,
        totalWidth: container_width,
        triangleSize: triangle_size
    }

    //selectors
    var $clear = $('#clear-stage'),
		$share = $('a.share'),
		$social_share = $('#socialShare'),
		$email_share = $('#socialShare .email'),
		$fb_share = $('#socialShare .fb'),
		$twitter_share = $('#socialShare .twitter'),
		$top = $('.top'),
		$warning = $('#warning'),
		$warning_close = $('#warning .close'),
		$canvasAlert = $('#canvasAlert'),
		$email_form = $("#email-form");

    var counter = [
		{ name: 'blue', count: 10 },
		{ name: 'gray', count: 10 },
		{ name: 'red', count: 10 }
    ];

    // shapes color, number and x
    var shapes = {
        blue: {
            name: 'blue',
            x: triangle_size / 2,
            color: "#344454",
            count: 10
        },
        gray: {
            name: 'gray',
            x: triangle_size + (triangle_size / 2),
            color: "#efece3",
            count: 10
        },
        red: {
            name: 'red',
            x: (triangle_size * 2) + (triangle_size / 2),
            color: "#f03941",
            count: 10
        }
    };

    //creating group so we can separate the triangles and the grid
    gridGroup = new Kinetic.Group({
        id: 'gridGroup',
        name: 'gridGroup',
        width: container_width,
        height: container_width
    });

    shapesGroup = new Kinetic.Group({
        id: 'shapesGroup',
        name: 'shapesGroup',
        width: $('#tangram-container').width(),
        height: triangle_size
    });


    //calculate the current cell the triangle is in
    function currentCell(mousePos) {
        var x = mousePos.x + column_width;
        var y = mousePos.y + column_height;

        if ((x < column_width) || (y < column_height) || (x > board_width + piece_width) || (y > board_height + (piece_height * 2))) {
            return "Out of bounds!";
            //console.log('x < column_width - out of bounds!');
        }

        x = Math.min(x, (board_width * piece_width) + piece_width);
        y = Math.min(y, (board_height * piece_height) + piece_height);

        cell_x = (Math.floor(x / piece_width)) - 1;
        cell_y = (Math.floor(y / piece_height)) - 1;

        if (grid[cell_x][cell_y] == undefined) {
            grid[cell_x][cell_y] = {};
        }

        var cell = grid[cell_x][cell_y];
        cell.cell_x = cell_x;
        cell.cell_y = cell_y;
        cell.x = cell_x * piece_width;
        cell.y = cell_y * piece_height;

        return cell;
    } //end currentCell

    var tooltip;

    function initTooltip() {
        if ($('html').hasClass('touch')) {
            tooltip = new Opentip(
				"div#container", //target element 
				{
				showOn: null,
				borderWidth: 5, style: "glass", target: false, tipJoint: "bottom", stem: "top", borderColor: "#344454", autoOffset: false
});
        }
        else {
            tooltip = new Opentip(
				"div#container", //target element 
				{
				showOn: null,
				borderWidth: 5, /*stemLength: 8, stemBase: 10,*/style: "glass", target: false, tipJoint: "top", /*tipJoint: "bottom", stem:"top",*/borderColor: "#344454"
});
        }
    }

    function drawShapes() {
        //add tooltip 
        //initTooltip();

        //position shape group
        shapesGroup.setAbsolutePosition(triangle_size / 2, 0);

        // create draggable shapes
        for (var key in shapes) {
            // anonymous function to induce scope
            (function () {
                var privKey = key;
                var shp = shapes[key];
                for (var n = 0; n < shp.count; n++) {
                    var shape = new Kinetic.Polygon({
                        id: 'id' + shp.name + shp.count, points: [0, triangle_size, triangle_size, triangle_size, triangle_size, 0],
                        name: shp.name,
                        fill: shp.color,
                        draggable: true,
                        x: shp.x,
                        y: triangle_size / 2,
                        offset: [triangle_size / 2, triangle_size / 2]
                    });
                    shapesGroup.add(shape);
                    shape.on('mouseover', function () {
                        document.body.style.cursor = 'pointer';
                    });

                    shape.on('mouseout', function () {
                        document.body.style.cursor = 'default';
                    });
                    shape.on('dragstart', function () {
                        this.moveToTop();
                        pieceLayer.draw();
                        $canvasAlert.hide();
                    });

                    shape.on('dragend', function (event) {
                        $warning.hide();
                        if (firstDrag === true) {
                            $canvasAlert.html($('#canvasAlertStage .second').html()).fadeIn();
                            window.firstDrag = false;
                        }
                        var mousePos, showTimeout;
                        if ($('html').hasClass('touch')) {
                            mousePos = stage.getTouchPosition();
                        }
                        else {
                            mousePos = stage.getMousePosition();
                        }
                        if (mousePos != undefined) {
                            cell = currentCell(mousePos);
                        }

                        var cookie_name = "tooltip";

                        if (isInside(this) && mousePos != undefined && cell.y != undefined && cell.x != undefined) {

                            //if inside just snap it to the cell
                            this.setPosition(cell.x, (cell.y + triangle_size / 2) + 20); //20 is the space btw the grid and the triangles
                        }

                        else {
                            //if outside snap it to the right location
                            snapToStacks(this);
                            //tooltip.hide();
                            //for(var i = 0; i < Opentip.tips.length; i ++) { Opentip.tips[i].hide(); }
                            //console.log('outside');
                        }

                        //create more triangles if run out
                        var counterObj = updateCounter(),
                            keys = Object.keys(counterObj),
                            totalCount = 0;
                        for (var i = 0; i < keys.length; i++) {

                            if (counter[keys[i]] <= 0) {
                                drawShapes();
                            }

                            totalCount += counter[keys[i]];
                        }

                        pieceLayer.draw();
                        //console.log(totalCount);

                        //check if canvas is empty					
                        if (totalCount < 30) {
                            window.canvasEmpty = false;
                        }
                        else {
                            window.canvasEmpty = true;
                        }
                        isCanvasEmpty();
                        //console.log(window.canvasEmpty);
                    });

                    shape.on('dblclick', function (event) {
                        if (isInside(this)) {
                            this.rotateDeg(90);
                            pieceLayer.draw();
                            //tooltip.hide();
                            $canvasAlert.hide();
                        }
                    });

                    shape.on('dbltap', function (event) {
                        if (isInside(this)) {
                            this.rotateDeg(90);
                            pieceLayer.draw();
                            //tooltip.hide();
                            $canvasAlert.fadeOut();
                        }
                    });
                }

                pieceLayer.add(shapesGroup);
                stage.add(pieceLayer);
            })();
        }
    } //end draw shape

    //draw grid
    function drawBoard() {
        var CELL_SIZE = triangle_size,
		w = 4,
		h = 4,
		W = w * CELL_SIZE,
		H = h * CELL_SIZE;

        //making the outer rect
        var grid = new Kinetic.Rect({
            x: 0,
            y: triangle_size,
            width: W + 1,
            height: H,
            id: 'grid'
        });
        gridGroup.add(grid);

        //creating vertical lines
        for (i = 0; i < w + 1; i++) {
            var I = i * CELL_SIZE;
            var vertical = new Kinetic.Line({
                stroke: '#C0C0C0',
                strokeWidth: 1,
                lineCap: 'round',
                lineJoin: 'round',
                points: [I, 0, I, H]
            });
            gridGroup.add(vertical);
        }

        //creating horizontal lines
        for (j = 0; j < h + 1; j++) {
            var J = j * CELL_SIZE;
            var horizontal = new Kinetic.Line({
                stroke: '#C0C0C0',
                strokeWidth: 1,
                lineCap: 'round',
                lineJoin: 'round',
                points: [0, J, W, J]
            });
            gridGroup.add(horizontal);
        }

        //draw a breakline
        var breakline = new Kinetic.Line({
            stroke: 'black',
            strokeWidth: 3,
            lineCap: 'round',
            lineJoin: 'round',
            points: [0, 0, container_width - 5, 0],
            x: 0,
            y: -1
        });
        //gridGroup.add(breakline);

        gridGroup.setAbsolutePosition(1, triangle_size + 20); //20 is the space btw the grid and the triangles
        boardLayer.add(gridGroup);

        stage.add(boardLayer);
        return grid;
    } //end draw grid

    //if inside the grid
    function isInside(shape) {
        var gridObj = stage.get('#grid')[0];
        var dropLeft = gridObj.getX() - (triangle_size / 2);
        var dropRight = dropLeft + gridObj.getWidth();
        var dropTop = gridObj.getY();
        var dropBottom = dropTop + gridObj.getHeight();
        var x = shape.getX();
        var y = shape.getY();

        return (x >= dropLeft && x <= dropRight && y >= dropTop && y <= dropBottom);
    }

    //snap to stacks
    function snapToStacks($this) {
        //rotate back to the normal position
        var currentDeg = $this.getRotationDeg(),
			newDeg = -currentDeg;
        $this.rotateDeg(newDeg);

        //then snap
        var y = triangle_size / 2;
        if ($this.attrs.name == 'blue') {
            $this.setPosition(triangle_size / 2, y);
        }
        else if ($this.attrs.name == 'gray') {
            $this.setPosition(triangle_size + (triangle_size / 2), y);
        }
        else {
            $this.setPosition((triangle_size * 2) + (triangle_size / 2), y);
        }
    }

    //update counter
    function updateCounter() {
        //Resets counter on each drag
        counter = {
            'blue': 0,
            'gray': 0,
            'red': 0
        };

        var shapesGroupLength = shapesGroup.getChildren().length;
        var keys = Object.keys(counter);
        //Loops over all shapes and updates counter based on isInside() status
        for (i = 0; i < shapesGroupLength; i++) {
            if (!isInside(shapesGroup.getChildren()[i])) {
                counter[shapesGroup.getChildren()[i].attrs.name] = counter[shapesGroup.getChildren()[i].attrs.name] + 1;
            }
        };

        return counter;

        //Updates counter markup to match
        /*for (i = 0; i < keys.length; i++){
        $('.counter li#'+keys[i]).text(counter[keys[i]]);						
        }*/
    }

    function bindEvents(stage) {

        //clear stage
        $clear.on('click', function () {
            $warning.hide(); $canvasAlert.hide(); window.canvasEmpty = true; isCanvasEmpty();
            $('#completion').hide();
            $('#confirmation').foundation('reveal', 'close');

            var shapesGroupLength = shapesGroup.getChildren().length;
            for (i = 0; i < shapesGroupLength; i++) {
                snapToStacks(shapesGroup.getChildren()[i]);
            };
            pieceLayer.draw();
        });

        //share		
        $share.on('click', function () {
            $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
        });

        var shareID;

        //email share
        $email_share.on('click', function (event) {
            $('#completion').hide();
            $("#emailForm")[0].reset();
            shareID = $(this).attr('id');
            createCroppedImage(stage, shareID);
            event.preventDefault();
        });
        $fb_share.on('click', function (event) {
            $('#completion').hide();
            shareID = $(this).attr('id');
            if (Modernizr.mq('only screen and (min-width: 1025px)')) {
                createCroppedImage(stage, shareID);
            }
            else {
                $canvasAlert.html($('#canvasAlertStage .third').html()).fadeIn().delay(3000).fadeOut();
                OpenFBSharePopUp(defaultImageURL);
                //event.stopPropagation();
            }

            event.preventDefault();
        });
        /*
        //facebook share
        $fb_share.on('click', function (event) {
            $('#completion').hide();
            shareID = $(this).attr('id');
            if (Modernizr.mq('only screen and (min-width: 1025px)')) {
                createCroppedImage(stage, shareID);
            }
            else {
                //$('#canvasAlert').html($('#canvasAlertStage .third').html()).fadeIn();
                OpenFBSharePopUp(defaultImageURL);
                //event.stopPropagation();
            }
            
            event.preventDefault();
        });
        */
        //twitter share
        $twitter_share.on('click', function (event) {
            shareID = $(this).attr('id');
            if (!Modernizr.mq('only screen and (min-width: 1025px)')) {
                $canvasAlert.html($('#canvasAlertStage .third').html()).fadeIn().delay(3000).fadeOut();
            }
        });
        /*
        //twitter share
        $twitter_share.on('click', function (event) {
            shareID = $(this).attr('id');
            $('#completion').show();
            //createCroppedImage(stage, shareID);
            //event.preventDefault();
        });
        */
        //warning close
        $('#warning .close, #completion .close').on('click', function (e) {
            $warning.hide(); $('#completion').hide();
            //$('#completion').fadeOut();
            e.preventDefault();
            return false;
        });


        $top.click(function (event) {
            $("html, body").animate({ scrollTop: 0 }, 600);
            event.preventDefault();
        });

        /*$(document).click(function () {
            $('#canvasAlert').hide();
        });*/

        //        $(document).mouseup(function (e) {
        //            var container = $("#canvasAlert");

        //            if (!container.is(e.target) // if the target of the click isn't the container...
        //				&& container.has(e.target).length === 0) // ... nor a descendant of the container
        //            {
        //                container.hide();
        //            }
        //        });
    }

    function createCroppedImage(stage, shareID) {
        var displayHeight = container_width + triangle_size + 20; //20 is the space btw the grid and the triangles
        var dataURLResult;
        gridGroup.hide();
        stage.draw();

        stage.toDataURL({
            callback: function (imageURL) {

                var tempStage = new Kinetic.Stage({
                    container: 'cropped-container',
                    width: container_width,
                    height: displayHeight
                });
                var tempLayer = new Kinetic.Layer();
                tempLayer.setAbsolutePosition(0, -(triangle_size + 20)); //20 is the space btw the grid and the triangles
                var imageObj = new Image();
                var croppedImage = new Kinetic.Image({
                    image: imageObj,
                    x: 0,
                    y: 0,
                    width: container_width,
                    height: displayHeight
                });
                imageObj.src = imageURL;

                imageObj.onload = function () {
                    tempLayer.add(croppedImage);
                    tempStage.add(tempLayer);
                    tempStage.toDataURL({
                        callback: function (croppedImageURL) {
                            window.croppedImage = croppedImageURL;
                            returnDataURL();

                            $canvasAlert.hide();

                            shareID = shareID.toString();

                            //                            if (window.canvasEmpty) {
                            //                                $warning.show();
                            //                            }
                            //                            else {
                            $warning.hide();
                            var QueryStringParam = "";
                            switch (shareID) {
                                case 'facebook':
                                    //window.open(croppedImageURL); //fb share function here
                                    ShareToFB(QueryStringParam, croppedImageURL);
                                    //$('#completion').show();
                                    break;
                                case 'twitter':
                                    //window.open(croppedImageURL); //twitter share function here

                                    window.open($('a#twitter').attr('href'));
                                    //ShareToTwitter(QueryStringParam, croppedImageURL);
                                    break;
                                case 'email':
                                    $('a.email-click').click();

                                    //prevent page refresh
                                    $email_form.on("valid invalid submit", function (e) {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (e.type === "valid") {
                                            LogAndSendEmailShare(QueryStringParam, croppedImageURL, $('#inputName').val(), $('#Message').val(), $('#inputEmail').val());
                                            $email_form.foundation('reveal', 'close');
                                            //$('#completion').show();
                                        }
                                    });


                                    break;

                            }
                            //}
                        },
                        mimeType: 'image/png',
                        quality: 1,
                        x: 0,
                        y: 0,
                        width: container_width - 1,
                        height: container_width - 3 //3 is the top border width
                    });
                };

            },
            mimeType: 'image/png',
            quality: 1,
            width: container_width,
            height: displayHeight
        });

        gridGroup.show();
        stage.draw();
    }


    //set cookie
    function setCookie(c_name, value, exhours) {
        //console.log('setCookie()::' + c_name);
        var exdate = new Date();
        exdate.setDate(exdate.getHours() + exhours);
        var c_value = escape(value) + ((exhours == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    };

    //get cookie
    function getCookie(c_name) {
        //console.log('getCookie()::' + c_name);
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == c_name) {
                var cookieValue = unescape(y);

                if (cookieValue == '') {
                    return null;
                }
                return cookieValue;
            }
        }

        return null;
    };

    function scrollUp() {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $top.fadeIn();
            } else {
                $top.fadeOut();
            }
        });

        $top.click(function (event) {
            $("html, body").animate({ scrollTop: 0 }, 600);
            event.preventDefault();
        });
    }

    //init the game
    function initCard(canvasElement, moveCountElement) {
        stage = new Kinetic.Stage({
            container: 'container',
            id: 'stage',
            width: container_width,
            height: container_width + triangle_size + 20
        });
        boardLayer = new Kinetic.Layer();
        pieceLayer = new Kinetic.Layer();

        drawBoard();
        drawShapes();
        bindEvents(stage);
        //scrollUp();
        //createCroppedImage(stage);	

    }

    return {
        start: initCard
    };

} ();

$(function () {
    if (Modernizr.canvas) {
        myTangram.start();
    }
});