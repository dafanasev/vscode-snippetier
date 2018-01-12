'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
const Hjson = require('hjson');

export default class Snippetier {

  private prefix: string;
  private description: string;
  private bodyLines: Array<string>;
  private snippetFilePath: string;

  constructor(context: vscode.ExtensionContext, languageId: string, prefix: string, description: string, body: string) {
    this.prefix = prefix;
    this.description = description;
    this.bodyLines = this.parseBody(body);

    const path = this.getPath();
    const vsCodeDirName = /insiders/.test(context.asAbsolutePath("")) ? '/Code - Insiders' : '/Code';
    this.snippetFilePath = path + vsCodeDirName + '/User/snippets/' + languageId + '.json';
  }

  public saveSnippet() {
    let json = {};

    if (fs.existsSync(this.snippetFilePath)) {
      const fileContents = fs.readFileSync(this.snippetFilePath, 'utf8').toString();
      json = Hjson.parse(fileContents);
    }

    json[this.description] = {
      prefix: this.prefix,
      description: this.description,
      body: this.bodyLines
    };

    fs.writeFileSync(this.snippetFilePath, Hjson.stringify(json, { quotes: 'all', separator: true }), 'utf8');
  }

  private getPath(): string {
    // windows
    const path = process.env.APPDATA;
    if (path) {
      return path;
    }
    else {
      switch (process.platform) {
        case 'darwin':
          return process.env.HOME + '/Library/Application Support';
        
        case 'linux':
          return os.homedir() + '/.config';
      
        default:
          return '/var/local';
      }
    }
  }

  private parseBody(bodyString: string): Array<string> {
    let lines = bodyString.split(/\r?\n/);

    const lineOffsets = lines.map(line => {
      let offset = 0;
      for (let i = 0; i < line.length; i++) {
        if (line[i] == ' ') {
          offset++;
          continue;
        }
        break;
      }
      return offset;
    });

    const minOffset = Math.min(...lineOffsets);

    if (minOffset > 0) {
      lines = lines.map(line => line.slice(minOffset));
    }

    return lines;
  }
}
