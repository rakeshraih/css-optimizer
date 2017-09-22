import { Component , OnInit} from '@angular/core';
import { Http } from '@angular/http';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  cssStyle = '';
  scriptDetail; string;
  scripts;
  scriptsLatest = new Subject<string>();
  resetObser = new Observable;
  inputCount = 10;
  cssUpdated = '';
  minifyStatus:boolean = false;
  groupStyle:boolean = true;

  constructor(public http: Http) {
   this.cssStyle = `div{
    color: green;
} div{ font-size: 14px;}div{background: green;}



div{margin: auto;}

            div{border-radius: 5px;}

h1{color: green;}

div{border: none;} span{color: green;}

p{color: green;}
p{background: green;}`;
   this.cssUpdated = this.refactorCSS(this.removeUnwantedTexts(this.cssStyle), this.groupStyle);

  }

  ngOnInit() {

  }

  changeInScriptName() {
    this.cssUpdated = this.refactorCSS(this.removeUnwantedTexts(this.cssStyle), this.groupStyle);
  }



removeUnwantedTexts(cssString) {

      const allLines = cssString.match(/^.+$/gm);
      let cleanString = '';
      let foundCommentedCode = false;

      for ( let line of allLines){

          line = line.trim();

          if (!line || line.match(/\/\*.*\*\//)){
              continue;
          }

          if (!foundCommentedCode && line.match(/^(\/\*).*/)){
             foundCommentedCode = true;
             continue;
          }

          if (foundCommentedCode && line.match(/.*$(\*\/)/)){
              foundCommentedCode = false;
              continue;
           }

          if (!foundCommentedCode) { cleanString += line };
      }

      return cleanString;

  }

refactorCSS(cssString, removeDuplicates) {

          cssString = cssString.trim().replace(/\s+/g, '`').replace(/(?:\r\n|\r|\n)/g, ''); // replacing all the spaces with ` to work on css

          const cssList = cssString.split('}'); // To split entire css string into individual blocks
          const individualBlockFromFile = [];
          for ( let each of cssList) {
              if (each && each.trim() != ' ') {
                  individualBlockFromFile.push(each+'}'.trim());
              }
          }

          const selectorCssMap = {};
          const allSelectors = [];
          //console.log(individualBlockFromFile);

          for ( let cssBlock of individualBlockFromFile) { //cssBlock is [.test{color: black;}]

              if (!cssBlock){
                 continue;
              }
              //console.log(cssBlock);
              const cssSingleSelector = cssBlock.split('{'); //cssSingleSelector = .test
              if (!cssSingleSelector && cssSingleSelector.length != 2){
                  continue;
               }
              let cssSingleSelectorContent = cssSingleSelector[1].replace('}',''); //cssSingleSelectorContent = color: black;
              cssSingleSelectorContent = cssSingleSelectorContent.replace(/\s+/g, '').replace(/ +/g, '').replace(/`/g, ' ').trim();
              cssSingleSelectorContent = cssSingleSelectorContent.split(';'); // cssSingleSelectorContent = [color: black]
              let selectorArray = cssSingleSelector[0].replace(/\s+/g, '').replace(/ +/g, '').replace(/`/g, ' ').trim().split(',');
              selectorArray=selectorArray.map(x => x.trim());

              for ( const short of cssSingleSelectorContent) {

                  if (short && short.trim()) {

                      if (selectorCssMap.hasOwnProperty(short.trim())){
                        const styleArray=selectorCssMap[short.trim()];
                          selectorArray.push(...styleArray);
                      }

                      selectorCssMap[short.trim()] = [...new Set(selectorArray)] ;

                      allSelectors.push(...selectorArray);
                  }
              }
          }
          console.log(selectorCssMap);
          const uniqueSelectors = [...new Set(allSelectors)];

          const optimizedCSS = !this.groupStyle ? this.listTheDiff(selectorCssMap,uniqueSelectors) : this.getOptimizedCSS(selectorCssMap);

          //console.log(optimizedCSS);
          console.log(uniqueSelectors);

          return optimizedCSS;
  }

  listTheDiff(selectorCssMap, uniqueSelectors){
    const selectorStyleMap = {};

      for (const selector of uniqueSelectors) {
        const styleArray = [];
          for (let key in selectorCssMap) {
              if (selectorCssMap[key].indexOf(selector) !== -1) {
                  styleArray.push(key);
              }
          }
          selectorStyleMap[selector] = styleArray;
      }
      return this.getOptimizedCSSDiff(selectorStyleMap);
  }

  getOptimizedCSSDiff(selectorStyleMap) {
      let optimizedCSS = '';
      for (const key in selectorStyleMap) {

        if (!this.minifyStatus) {
      optimizedCSS +=
`${key} {
          ${selectorStyleMap[key].join(';\n          ')};
}

`;
        }else {
          optimizedCSS += `${key}{${selectorStyleMap[key].join(';')};}`;
        }
      }

      optimizedCSS = this.minifyStatus ? optimizedCSS.replace(/: /g,':') : optimizedCSS;

      return optimizedCSS;
  }

  getOptimizedCSS(selectorCssMap) {
  let optimizedCSS = '';

     for (const key in selectorCssMap) {
      if (!this.minifyStatus) {
  optimizedCSS +=
  `${selectorCssMap[key].join(', ')} {
          ${key};
  }

  `;
     }else {
      optimizedCSS += `${selectorCssMap[key].join(', ')}{${key};}`;
     }
      }

      optimizedCSS = this.minifyStatus ? optimizedCSS.replace(/: /g, ':') : optimizedCSS;

      return optimizedCSS;
  }

}
