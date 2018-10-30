#!/usr/bin/env python
import os
import sys
import importlib

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "a_socials.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        # The above import may fail for some other reason. Ensure that the
        # issue is really that Django is missing to avoid masking other
        # exceptions on Python 2.
        if not importlib.util.find_spec('django'):
            raise ImportError(
                "Couldn't import Django. Are you sure it's installed and "
                "available on your PYTHONPATH environment variable? Did you "
                "forget to activate a virtual environment?"
            )
    execute_from_command_line(sys.argv)
