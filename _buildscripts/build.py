#!/usr/bin/env python3
"""main build script."""

import argparse
import configparser
import re
import sys
from pathlib import Path
from os import environ
from shutil import copytree
from datetime import date, datetime

extra_version = ''

def get_info(base_url):
  infotext = '/* Copyright {} AlterTobi'.format(date.today().year)
  infotext += '''

   This file is part of the Wayfarer Extension Scripts collection.

   Wayfarer Extension Scripts are free software: you can redistribute and/or modify
   them under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   Wayfarer Extension Scripts are distributed in the hope that they will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   GNU General Public License for more details.

   You can find a copy of the GNU General Public License at the
   web space where you got this script from
'''
  infotext += '   {}LICENSE.txt'.format(base_url)

  infotext += '''
   If not, see <http://www.gnu.org/licenses/>.
*/

'''
  return infotext
    
def replace_placeholder_in_files(directory, placeholder, replacement, file_extension=".md"):
    """
    Ersetzt einen Platzhalter in allen Dateien mit einer bestimmten Erweiterung im angegebenen Verzeichnis.
    
    :param directory: Pfad zum Verzeichnis, in dem die Dateien durchsucht werden sollen.
    :param placeholder: Der Platzhalter, der ersetzt werden soll.
    :param replacement: Der Wert, der den Platzhalter ersetzen soll.
    :param file_extension: Die Dateierweiterung der Dateien, die geprüft werden (Standard: '.md').
    """
    for file in directory.glob(f'*{file_extension}'):  # Nur Dateien mit der angegebenen Erweiterung
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if placeholder in content:
            content = content.replace(placeholder, replacement)
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Replaced placeholder in: {file.name}")
            
def readtext(filename):
  return filename.read_text(encoding='utf-8-sig')

def fill_meta(source, script_name):
  allowed_multiple = ['resource']  # Definierte Schlüssel, die mehrfach vorkommen dürfen
  # grant muss man dann nochmal extra machen (none)

  meta = ['// ==UserScript==']
  keys = set()

  def append_line(key, value):
    """
    Fügt eine Zeile zum Meta-Block hinzu, erlaubt aber bestimmte Schlüssel mehrfach.

    :param key: Der Metadaten-Schlüssel (z. B. 'resource').
    :param value: Der zugehörige Wert (z. B. 'http://example.com/resource.js').
    """
    if key in allowed_multiple:
      # Erlaubt mehrfaches Hinzufügen
      meta.append(f'// @{key:<14} {value}')
    elif key not in keys:
      # Fügt einmalig hinzu, wenn nicht bereits vorhanden
      meta.append(f'// @{key:<14} {value}')
      keys.add(key)

  for line in source.splitlines():
    text = line.lstrip()
    rem = text[:2]
    if rem != '//':
      raise UserWarning(f'{script_name}: wrong line in metablock: {line}')
    text = text[2:].strip()
    try:
      key, value = text.split(None, 1)
    except ValueError:
      if text == '==UserScript==':
        # raise UserWarning(f'{script_name}: wrong metablock detected')
        continue
      elif text == '==/UserScript==':
        # raise UserWarning(f'{script_name}: wrong metablock detected')
        continue
    else:
      if key[0] == '@':
        key = key[1:]
      else:  # continue previous line
        meta[-1] += ' ' + text
        continue

      if key == 'version':
        if not re.match(r'^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$', value):
          print(f'{script_name}: wrong version format: {value}')  # expected: major.minor.patch
        value += extra_version
        sversion = value
      elif key == 'name':
          sname = value 
          value = 'WFES - ' + value
      elif key == 'description':
        sdescription = value 

      append_line(key,value)

  append_line('namespace', cfg['namespace'])
  append_line('homepage', cfg['homepage'])
  append_line('supportURL', cfg['supportURL'])
  # append_line('icon', 'https://wayfarer.nianticlabs.com/imgpub/favicon-256.png')
  append_line('icon', cfg['favicon'])
  append_line('icon64', cfg['favicon64'])
  
  url_dist_base = cfg.get('url_dist_base',fallback = False)
  if url_dist_base:
    path = url_dist_base + script_name
    surl = path + '.user.js'
    if keys.isdisjoint({'downloadURL'}):
      append_line('downloadURL', path + '.user.js')
      append_line('updateURL', path + '.meta.js')

  if keys.isdisjoint({'match', 'include'}):
    append_line('match', cfg['match'])

  append_line('grant', 'none')
  meta.append('// ==/UserScript==\n\n')
  
  sl = '  * [{}]({}) {}\n    - {}\n'.format(sname,surl,sversion,sdescription)
  return '\n'.join(meta), sl

def process_file(source, out_dir):
  """Generate .user.js and .meta.js from given source file.

    Resulted file(s) put into out_dir (if specified, otherwise - use current).
    """
  try:
    meta, script = readtext(source).split('\n\n', 1)
  except ValueError:
    raise Exception(f'{source}: wrong input: empty line expected after metablock')

  script_name = source.stem

  meta, shortl = fill_meta(meta, script_name)

  info = get_info(cfg.get('url_dist_base',fallback = False))

  body =  re.sub(r'\$__(\w+)__', lambda match: environ.get(match.group(1), match.group(0)), script)

  data = [
    meta,
    info,
    body
    ]

  (out_dir / (script_name + '.user.js')).write_text(''.join(data), encoding='utf8')
  (out_dir / (script_name + '.meta.js')).write_text(meta, encoding='utf8')
  return shortl

def run():
  global extra_version
  source = Path('..')
  target = Path('../build')

  target.mkdir(parents=True,exist_ok = True)
  
  # copy all from _pages
  pagesrc = source / '_pages/'
  copytree(pagesrc,target,dirs_exist_ok=True) 
  
  # Replace placeholder in Markdown files
  current_year = str(date.today().year)
  placeholder = "{{CURRENT_YEAR}}"
  replace_placeholder_in_files(target, placeholder, current_year)
    
  # copy LICENSE
  print('process LICENSE')
  lic = source / 'LICENSE'
  # tf = target / lic.name
  tf = target / 'LICENSE.txt'

  if sys.version_info >= (3, 10):
    tf.hardlink_to(lic) # create a hard link
  else:
    lic.link_to(tf) # create a hard link

  # check if beta (issue, hotfix, feature)
  ref = re.match('refs/heads/(\w+)/([\w#\-\.\_]+)?',environ['GITHUB_REF'])
  if ref:
    if ref.group(1) == 'issue':
      extra_version = '-beta'+environ['GITHUB_RUN_NUMBER']+'.issue' + ref.group(2)[1:]
    elif ref.group(1) in ['feature', 'hotfix', 'test']:
      extra_version = '-beta'+environ['GITHUB_RUN_NUMBER']+'.' + ref.group(1) + '.' + ref.group(2)
  
  # process js files
  shortlist = []
  shortlist.append('## shortlist\n\n')
  
  # Aktuelles Datum und Uhrzeit abrufen
  current_time = datetime.now().strftime('%Y/%m/%d %H:%M')
  shortlist.append(f'created automatically at {current_time}\n\n')

  shortlist.append('Not all scripts on this page are fully functional. This list is for reference only. Use at your own risk.\n\n')
  
  all_files = list(source.glob('**/wfes*.js'))
  all_files.sort(key=lambda self: self.parts[-1].lower())
  for filename in all_files:
    print('process file {} {}'.format(filename,target))
    short = process_file(
      filename,
      target
      )
    shortlist.append(short)

  shortdest = target / 'shortlist.md'
  shortdest.write_text(''.join(shortlist), encoding='utf8')

##### MAIN ######

if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('--config_file', '-c', help='config file', default='build.ini')
  args = parser.parse_args()
  
  config = configparser.ConfigParser()
  config.read(args.config_file)
  cfg = config['defaults']
  run()
