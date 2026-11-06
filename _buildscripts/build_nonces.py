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
from hashlib import shake_128

extra_version = ''

def run():
  global extra_version
  source = Path('..')
  
  all_files = list(source.glob('**/wfes*.js'))
  all_files.sort(key=lambda self: self.parts[-1].lower())
  for filename in all_files:
      script_name = filename.stem
      nonce = shake_128(script_name.encode("UTF-8")).hexdigest(5) 
      print(f'"{nonce}":"{script_name}",')


##### MAIN ######

if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('--config_file', '-c', help='config file', default='build.ini')
  args = parser.parse_args()
  
  config = configparser.ConfigParser()
  config.read(args.config_file)
  cfg = config['defaults']
  run()
