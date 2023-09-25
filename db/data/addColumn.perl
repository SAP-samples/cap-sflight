use strict;
use warnings;
use Text::CSV 'csv';

my $rows = csv(in => *STDIN, encoding => 'UTF-8', auto_diag => 2, sep_char => ";", keep_headers => \my @headers);

push @headers, 'TotalPriceRounded';
foreach my $row (@$rows) {
  $row->{TotalPriceRounded} = sprintf("%.0f",$row->{TotalPrice});
}

csv(in => $rows, out => *STDOUT, encoding => 'UTF-8', auto_diag => 2,
  sep_char => ";", headers => \@headers);

