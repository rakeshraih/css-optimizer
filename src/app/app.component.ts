import { Label } from './label';
import { Component , OnInit} from '@angular/core';
import { Http } from '@angular/http';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import { Tweet } from './tweet';
import { TweetService } from './tweet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    keysListAt: Tweet[];
    labelList: Label[];

    key = '';
    labelName = '';

    newSubject = new Subject<string>();

    constructor(private tweetService: TweetService) {
        this.keysListAt = this.tweetService.getTweetsFromLocalStorage();
        this.labelList = this.tweetService.getLabelsFromLocalStorage();
        this.key = 'NASA';
        this.labelName = 'Tech';

    }

    ngOnInit() {
        const that = this;
        this.newSubject.subscribe(
            data => {

                this.tweetService.setTweetsToLocalStorage(this.keysListAt);
                (<any>window).twttr = (function (d, s, id) {
                    let js: any, fjs = d.getElementsByTagName(s)[0],
                        t = (<any>window).twttr || {};
                    if (d.getElementById(id)) { return t; }
                    js = d.createElement(s);
                    js.id = id;
                    js.src = 'https://platform.twitter.com/widgets.js';
                    fjs.parentNode.insertBefore(js, fjs);
                    t._e = [];
                    t.ready = function (f: any) {
                        t._e.push(f);
                    };
                    return t;
                  }(document, 'script', 'twitter-wjs'));

                 // if ((<any>window).twttr.ready())
                    (<any>window).twttr.widgets.load();
                    setTimeout(function() {
                        that.cleariFrameElements();
                      }, 1500);

            },
            error => alert(error)
          );

          setTimeout(function() {
            that.cleariFrameElements();
          }, 1000);

          setInterval(function() {
            that.cleariFrameElements();
          }, 1000);

          document.addEventListener('click', function(){
            if (document.querySelector('.fa-tag.hide')) { document.querySelector('.fa-tag.hide').classList.remove('hide');}
            if (document.querySelector('.item-class.hide')) { document.querySelector('.item-class.hide').classList.remove('hide');}
            if (document.querySelectorAll('.tag-selector:not(.hide)')[0]) { 
                document.querySelectorAll('.tag-selector:not(.hide)')[0].classList.add('hide');
            }
          });
    }

    cleariFrameElements() {
        const iframes = document.querySelectorAll('iframe.twitter-timeline');
        [].forEach.call(iframes, function(iframe) {
        // do whatever
        if (iframe.contentWindow.document.querySelector('.timeline-Header')) {
            iframe.contentWindow.document.querySelector('.timeline-Header').remove();
        }
        });
    }

    tagKeys(event, key) {

        if (document.querySelector('.fa-tag.hide')) { document.querySelector('.fa-tag.hide').classList.remove('hide');}
        if (document.querySelector('.item-class.hide')) { document.querySelector('.item-class.hide').classList.remove('hide');}
        if (document.querySelectorAll('.tag-selector:not(.hide)')[0]) { 
            document.querySelectorAll('.tag-selector:not(.hide)')[0].classList.add('hide');
        }
        event.target.classList.toggle('hide');
        event.target.parentNode.parentNode.querySelector('.item-class').classList.toggle('hide');
        event.target.parentNode.parentNode.querySelector('.tag-selector').classList.toggle('hide');
        event.stopPropagation();
    }

    selectedTag(event, type, key) {
        if (document.querySelector('.fa-tag.hide')) { document.querySelector('.fa-tag.hide').classList.remove('hide');}
        if (document.querySelector('.item-class.hide')) { document.querySelector('.item-class.hide').classList.remove('hide');}
        if (document.querySelectorAll('.tag-selector:not(.hide)')[0]) { 
            document.querySelectorAll('.tag-selector:not(.hide)')[0].classList.add('hide');
        }
        
        for (const tweet of this.keysListAt){
            if (key === tweet.key) {
                tweet.type = type;
            }
        }
       
        event.preventDefault();
        event.stopPropagation();
    }

    addKey($event) {

       const index = this.keysListAt.findIndex(i => i.key.toLowerCase() === this.key.toLowerCase());

       setTimeout(function() {
        document.getElementById('user-msg').innerText = '';
      }, 3000);

       if ( index !== -1) {
           document.getElementById('user-msg').innerText = this.key + ' is already added, avilabel under \'Tweets by @\'  tab.';
           return;
       }

       if (!this.key || this.key.trim() === '') {
        return;
       }
      // this.keysListAt.push(this.key);
       const newTweet = new Tweet();
       newTweet.key = this.key;
       newTweet.shown = true;
       newTweet.type = 'other';

       this.keysListAt.push(newTweet);
       this.key = '';
       this.newSubject.next(this.key);
       $event.stopPropagation();
    }

    addLabel() {
        const index = this.labelList.findIndex(i => i.labelName.toLowerCase() === this.labelName.toLowerCase());
        if ( index !== -1) {
            return;
        }

        const localLable = new Label();
        localLable.labelKey = this.labelName.toLowerCase();
        localLable.isShown = true;
        localLable.showLabel = true;
        localLable.labelClass = 'fa fa-star';
        localLable.labelName = this.labelName;
        localLable.deleted = true;
        this.labelList.push(localLable);

        this.tweetService.setLabelsToLocalStorage(this.labelList);
        this.labelName = '';
    }

    deleteKeys($event, key) {

        const index = this.keysListAt.findIndex(i => i.key === key.key);
        this.keysListAt.splice(index, 1);

        this.newSubject.next(this.key);
        $event.stopPropagation();
    }

    showHideLabels(labelType) {

        for (const label of this.labelList){
            if (labelType === label.labelKey) {
                label.showLabel = !label.showLabel;
            }
        }

        this.tweetService.setLabelsToLocalStorage(this.labelList);
        event.preventDefault();
        event.stopPropagation();
    }

    deleteLabels($event, labelKey) {

        const index = this.labelList.findIndex(i => i.labelKey === labelKey);

        for (const tweet of this.keysListAt){
            if (labelKey.toLowerCase() === tweet.type) {
                tweet.type = 'other';
            }
        }
        this.labelList.splice(index, 1);
        this.tweetService.setLabelsToLocalStorage(this.labelList);
        $event.stopPropagation();
    }

    showHideTwitterWidget(event, key) {

        for (const tweet of this.keysListAt){
            if (key === tweet.key) {
                tweet.shown = !tweet.shown;
            }
        }
        this.newSubject.next(this.key);
    }

    totalCountOfEachLabel(key) {
        let count = 0 ;
        for (const tweet of this.keysListAt){
            if (key === tweet.type) {
                count++;
            }
        }

      return count === 0 ? true : false;
    }

}
