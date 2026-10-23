from django.core.management.base import BaseCommand
from apps.jobs.services.career_scout_agent import OfficialCareerScoutAgent

class Command(BaseCommand):
    help = "Runs the Official Career Scout Agent to sweep official company career portals and multi-source job boards."

    def add_arguments(self, parser):
        parser.add_argument(
            '--official-only',
            action='store_true',
            help='Only scout official company career websites',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=15,
            help='Limit openings indexed per portal',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("[AGENT] Launching Official Career Scout Agent..."))
        
        if options['official_only']:
            res = OfficialCareerScoutAgent.sweep_official_portals(limit_per_portal=options['limit'])
            self.stdout.write(self.style.SUCCESS(
                f"[OK] Official sweep complete: {res.get('openings_indexed')} openings from {res.get('portals_scanned')} portals in {res.get('duration_seconds')}s."
            ))
        else:
            res = OfficialCareerScoutAgent.run_full_scout_sweep()
            self.stdout.write(self.style.SUCCESS(
                f"[OK] Full sweep complete: {res.get('total_indexed')} total openings indexed."
            ))
