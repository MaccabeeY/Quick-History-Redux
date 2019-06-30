'use strict';

class TimelineList extends List {
  constructor() {
    super();
    this.linksToRemove_ = [];
  }

  get isActive() {
    return super.isActive;
  }

  set isActive(value) {
    super.isActive = value;
    document.documentElement.classList.toggle(TimelineList.ID, this.isActive);
  }

  get searchField() {
    return document.querySelector('#manager header input');
  }

  get query() {
    return sessionStorage.getItem(SearchList.SETTING_QUERY) || '';
  }

  set query(value) {
    sessionStorage.setItem(SearchList.SETTING_QUERY, value);
  }

  sortBy_(data, prop) {
    data.sort(function(a, b) {
      if (b[prop] === a[prop]) {
        return 0;
      }

      return b[prop] > a[prop] ? 1 : -1;
    });
  }

  getVisitDay_(time) {
    var lang = window.navigator.language;
    var format = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    var now = Date.now();
    var today = new Date(now).toLocaleDateString(lang, format);
    var yesterday = new Date(now - 24*60*60*1000).toLocaleDateString(lang,
                                                                     format);
    var header = new Date(time).toLocaleDateString(lang, format);
    if (header === today) {
      return i18n.get('headerToday');
    } else if (header === yesterday) {
      return i18n.get('headerYesterday');
    }

    return header;
  }

  getGroupName_(url) {
    return new URL(url).host;
  }

  groupByDays_(visits) {
    this.sortBy_(visits, TimelineList.SORT_BY_VISIT_TIME);

    if (!settings.get(Page.SETTING_LIST_TIMELINE_GROUP_DAY)) {
      return [{
        visits: visits
      }];
    }

    return visits.reduce(function(days, visit) {
      if (!days.length || days[days.length - 1].name !== visit.day) {
        days.push({
          name: visit.day,
          visits: [visit]
        });
      } else {
        days[days.length - 1].visits.push(visit);
      }

      return days;
    }, []);
  }

  groupByDomains_(visits) {
    if (!settings.get(Page.SETTING_LIST_TIMELINE_GROUP_DOMAIN)) {
      return [{
        visits: visits
      }];
    }

    this.sortBy_(visits, TimelineList.SORT_BY_GROUP);

    var groups = visits.reduce(function(groups, visit) {
      if (!groups.length || groups[groups.length - 1].name !== visit.group) {
        groups.push({
          name: visit.group,
          favicon: favicon.getURL(visit.url),
          visitTime: visit.visitTime,
          visits: [visit]
        });
      } else {
        var group = groups[groups.length - 1];
        group.visits.push(visit);
        group.visitTime = Math.max(visit.visitTime, group.visitTime);
      }

      return groups;
    }.bind(this), []);

    this.sortBy_(groups, TimelineList.SORT_BY_VISIT_TIME);

    groups.forEach(function(group) {
      this.sortBy_(group.visits, TimelineList.SORT_BY_VISIT_TIME);
    }.bind(this));

    return groups;
  }

  fetch_(data) {
    this.sortBy_(data, TimelineList.SORT_BY_LAST_VISIT_TIME);
    var lastVisitTime = data[data.length - 1].lastVisitTime;
    var visits = [];

    var loadAllVisits = data.map(function(item) {
      return new Promise(function(resolve, reject) {
        chrome.history.getVisits({
          url: item.url
        }, function(results) {
          results.forEach(function(result) {
            if (lastVisitTime > result.visitTime) {
                //&& (hasMoreItems || request.startTime > result.visitTime))
              return;
            }
            visits.push({
              url: item.url,
              title: item.title,
              visitTime: result.visitTime,
              day: this.getVisitDay_(result.visitTime),
              group: this.getGroupName_(item.url)
            });
          }.bind(this));
          resolve();
        }.bind(this));
      }.bind(this));
    }.bind(this));

    return Promise.all(loadAllVisits).then(function() {
      var days = this.groupByDays_(visits);

      days = days.map(function(day) {
        var uniqueURLs = [];
        var visits = [];

        this.sortBy_(day.visits, TimelineList.SORT_BY_VISIT_TIME);

        day.visits.filter(function(visit) {
          if (uniqueURLs.indexOf(visit.url) === -1) {
            visits.push(visit);
            uniqueURLs.push(visit.url);
          }
        });

        return {
          name: day.name,
          groups: this.groupByDomains_(visits)
        }
      }.bind(this));

      return Promise.resolve(days);
    }.bind(this));
  }

  render(list, visits) {
    if (SearchList.query) {
      this.isActive = false;
      return Promise.resolve();
    } else {
      this.isActive = true;
      list.textContent = '';
    }

    if (!visits.length) {
      var message = this.Templates.listMessage(i18n.get('noHistory'));
      list.appendChild(message);
      return Promise.resolve();
    } else {
      return super.render(list, visits).then(function(data) {
        return new Promise(function(resolve, reject) {
          data.forEach(function(day) {
            var groups = day.groups.map(function(group) {
              var items = group.visits.map(function(visit) {
                return this.Templates.item(visit);
              }.bind(this));
              return this.Templates.group(group.name, group.favicon, items);
            }.bind(this));

            list.appendChild(this.Templates.day(day.name, groups));

          }.bind(this));

          resolve();
        }.bind(this));
      }.bind(this));
    }
  }
}

TimelineList.Templates = class extends List.Templates {};

TimelineList.ID = 'timeline-view';
TimelineList.SORT_BY_VISIT_TIME = 'visitTime';
TimelineList.SORT_BY_LAST_VISIT_TIME = 'lastVisitTime';
TimelineList.SORT_BY_GROUP = 'group';
