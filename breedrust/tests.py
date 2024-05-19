from django.test import TestCase
from .services.compute import calculate_weight

# Create your tests here.
# Run tests using `python manage.py test`

class ComputationTest(TestCase):
  def test_calculate_weight(self):
    output = calculate_weight("YYYYGG")
    self.assertEqual(round(output,1), 11.6)