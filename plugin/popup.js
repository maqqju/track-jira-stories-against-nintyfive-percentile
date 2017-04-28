var e = {
	x : ['1','2','3','5','8'],
	y : [],
	name : 'E',
	type: 'bar',
	marker: {
		color: 'green'
	}
};

var sd1 = {
	x : ['1','2','3','5','8'],
	y : [],
	name : 'SD1',
	type: 'bar',
	marker: {
		color: 'yellow'
	}
};

var sd2 = {
	x : ['1','2','3','5','8'],
	y : [],
	name : 'SD2',
	type: 'bar',
	marker: {
		color: 'red'
	}	
};

var SPRINT_ID_PLACEHOLDER = '||SPRINTID||';

function initSprint(callback) {


	chrome.storage.sync.get('sprintId', function(items) {
			var _sprintId = items.sprintId;
			sessionStorage.setItem('sprintId', items.sprintId);
			chrome.storage.sync.get('jiraUrl', function(items) {

				sessionStorage.setItem('jiraUrl', items.jiraUrl);

				getDataForSprint(_sprintId, (_d) => {
					var _statuses = _d.map((_i) => {
						return _i.fields.status.name;
					});

					var _unique = Array.from(new Set(_statuses));
					var _drpStatus = document.getElementById('drpStatus');

					_unique.forEach((_s) => {
						var _o = document.createElement('option');
						_o.value = _s;
						_o. innerHTML = _s;
						_drpStatus.appendChild(_o);
					});
				});


				callback(_sprintId);
			});

			document.getElementById('btnInProgress').addEventListener('click', () => {
				var _drpStatus = document.getElementById('drpStatus');
				var _status = _drpStatus.options[_drpStatus.selectedIndex].value;
				loadGraph(sessionStorage.getItem('sprintId'), _status);
			});
	});

}

function getJiraUrl(sprintId) {
	var _jiraUrl = sessionStorage.getItem('jiraUrl');

	return _jiraUrl.replace(SPRINT_ID_PLACEHOLDER, sprintId);
}

function getDataForSprint(sprintId, cb) {

	if (sessionStorage.getItem('sprintData') === null) {
		$.ajax
		  ({
		    type: "GET",
		    url: getJiraUrl(sprintId),
		    dataType: 'json',
		    async: false,
		    crossDomain: true,
		    success: (d) => {
		    	var _pointedStories = d.issues.filter((_issue) => {
					return _issue.fields.customfield_10002 && _issue.fields.customfield_10002 !== null;
				});

		    	sessionStorage.setItem('sprintData', JSON.stringify(_pointedStories));
		    	cb(_pointedStories);
		    }
		});	
	} else {
		var _d = JSON.parse(sessionStorage.getItem('sprintData'));
		cb(_d);
	}

}


function filterData(d, _status, _notStatus) {

	if (!d.length) {
		return [];
	}

	return d.filter((_issue) => {
		return _issue.fields.customfield_10002 !== null
	}).filter((_issue) => {
		if (_status) {
			return _issue.fields.status.name === _status;
		} else {
			return _issue.fields.status.name;
		}
	}).filter((_issue) => {
		if (_notStatus) {
			return _issue.fields.status.name !== _notStatus;
		} else {
			return _issue.fields.status.name;
		}
	}).map((_issue) => {
		return {
			taskId : _issue.key,
			points : _issue.fields.customfield_10002,
			workLogTimeSpentSeconds : _issue.fields.timespent
		}
	});
}

function loadGraph(sprintId, status, notStatus) {
	getDataForSprint(sprintId, (d) => {
			var _sprintItems = filterData(d,status,notStatus);
			drawGraph(_sprintItems);
		}
	);	
}

function drawGraph(_sprintItems) {
	var counters = {};

	var ranked = _sprintItems.map((_i) => {
	   var _c = counters[_i.points];
	   var _d = '';
	   if (_c === undefined) {
	      _c = counters[_i.points] = 0;
	   } else {
	   	_c+=2;
	   	counters[_i.points]+=2;
	   }

	   if (_c <= 9) {
	      _d += '0'+_c;
	   }

	   _i.xIndex = _i.points+'.'+_d;
	   return _i;
	}).sort((a,b) => new Number(b) - new Number(a));

	var scatterPlot = {
	  x: ranked.map((a) => a.xIndex),
	  y: ranked.map((a) => a.workLogTimeSpentSeconds === null ? 0 : a.workLogTimeSpentSeconds),
	  mode: 'markers',
	  type: 'scatter',
	  name: 'Stories',
	  text: ranked.map((a) => a.taskId),
	  marker: { 
	  	size: 12,
	  	color : 'black'
	  }
	};

	var data = [e,sd1,sd2, scatterPlot];

	var layout = {
		barmode: 'stack',
		xaxis: {
			title : 'Story Points'
		},
		yaxis: {
			title : 'Time in seconds'
		}
	};

	Plotly.newPlot(document.getElementById('storiesAgainstPointsInTime'), data, layout );
}


document.addEventListener('DOMContentLoaded', function() { 
	initSprint(loadGraph);
});