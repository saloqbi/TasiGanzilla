,['Monthly','Monthly'],['Weekly','Weekly'],['Daily','Daily'],['Hourly','Hourly'],['Live','Live']]);

  var counter=sections('Counter')[0];
  if(counter){
    bodyFor(counter).innerHTML=
      row('Visible','<input id="counterVisible" type="checkbox" aria-label="Counter visible">')+
      row('Wheel','<input id="counterWheel" type="number" min="1" max="13" step="1" aria-label="Counter wheel">')+
      row('Start','<input id="counterStart" type="number" step="1" aria-label="Counter start">')+
      row('Count','<input id="counterCount" type="number" min="1" max="360" step="1" aria-label="Counter count">')+
      row('Increment','<input id="counterIncrement" type="number" step="1" aria-label="Counter increment">')+
      row('Font size','<input id="counterFontSize" type="number" min="10" max="48" step="1" aria-label="Counter font size">');
    setExpanded(counter,true);
  }

  var scales=sections('Secondary scale');
  if(scales[0])bodyFor(scales[0]).innerHTML=
    row('Visible','<input id="secondaryOneVisible" type="checkbox" aria-label="Secondary scale one visible">')+
    row('Wheel','<input id="secondaryOneWheel" type="number" min="1" max="13" step="1" aria-label="Secondary scale one wheel">')+
    row('Divisions','<input id="secondaryOneDivisions" type="number" min="4" max="360" step="1" aria-label="Secondary scale one divisions">')+
    row('Offset','<input id="secondaryOneOffset" type="number" min="-360" max="360" step="1" aria-label="Secondary scale one offset">')+
    row('Labels','<input id="secondaryOneLabels" type="checkbox" aria-label="Secondary scale one labels">');
  if(scales[1])bodyFor(scales[1]).innerHTML=
    row('Visible','<input id="secondaryTwoVisible" type="checkbox" aria-label="Secondary scale two visible">')+
    row('Wheel','<input id="secondaryTwoWheel" type="number" min="1" max="13" step="1" aria-label="Secondary scale two wheel">')+
    row('Divisions','<input id="secondaryTwoDivisions" type="number" min="4" max="360" step="1" aria-label="Secondary scale two divisions">')+
    row('Offset','<input id="secondaryTwoOffset" type="number" min="-360" max="360" step="1" aria-label="Secondary scale two offset">')+
    row('Labels','<input id="secondaryTwoLabels" type="checkbox" aria-label="Secondary scale two labels">');

  var markers=sections('Marker');
  if(markers[0])bodyFor(markers[0]).innerHTML=
    row('Visible','<input id="markerOneVisible" type="checkbox" aria-label="Marker one visible">')+
    row('Wheel','<input id="markerOneWheel" type="number" min="1" max="13" step="1" aria-label="Marker one wheel">')+
    row('Value','<input id="markerOneValue" type="number" step="1" aria-label="Marker one value">')+
    row('Shape','<select id="markerOneShape" aria-label="Marker one shape">'+option('Diamond')+option('Triangle')+option('Circle')+'</select>');
  if(markers[1])bodyFor(markers[1]).innerHTML=
    row('Visible','<input id="markerTwoVisible" type="checkbox" aria-label="Marker two visible">')+
    row('Wheel','<input id="markerTwoWheel" type="number" min="1" max="13" step="1" aria-label="Marker two wheel">')+
    row('Value','<input id="markerTwoValue" type="number" step="1" aria-label="Marker two value">')+
    row('Shape','<select id="markerTwoShape" aria-label="Marker two shape">'+option('Triangle')+option('Diamond')+option('Circle')+'</select>');

  var mapping=[
    ['Layout visible','layoutVisible'],['Layout clockwise','clockwise'],['Size','size'],['View','view'],['Data type','dataType'],
    ['Value','value'],['Find','find'],['Increment','increment'],
    ['Highlight visible','highlightVisible'],['Highlight fill','highlightFill'],['Show marks','highlightMarks'],['Show numbers','highlightNumbers'],
    ['Protractor visible','protractorVisible'],['Protractor clockwise','protractorClockwise'],['Protrac