package VidinCalafatBridge;

use utf8;
use strict;
use Data::Dumper;

use CGI;
use Mojo::DOM;
use LWP::UserAgent;
use IO::File;
use Text::CSV;

use Log::Log4perl qw(:easy);
    Log::Log4perl->easy_init($ERROR);


our $REQ_URL = "http://www.vidincalafatbridge.bg/en/page/117";
our $REQ_TIMEOUT = 10;
our $CSV_FILE = 'VidinCalafatBridgeStats.csv';

sub new($;$)
{
    my ($class, $settings) = @_;
    my $self = {
        %{ $settings || {} },
    };

    bless $self, $class;

    return $self;
}

sub Handler($)
{
    my ($self) = @_;

    $$self{cgi} = new CGI;

    
}

sub ExtractTraffic($)
{
    my ($self) = @_;
    my $ua = LWP::UserAgent->new;

    $ua->timeout( $REQ_TIMEOUT );

    INFO "Requesting $REQ_URL";
    my $resp = $ua->get($REQ_URL);

    if($resp->is_success)
    {
        INFO "Successful request";
        DEBUG "REQUESTED: $resp->decoded_content";

        my $dom = Mojo::DOM->new($resp->decoded_content);
        my $content = $dom->at("article.content");
        my $result = [];

        #print Dumper ($content);
        
        my @strs = $content->find('p')->each;
        
        for my $i ( 0 .. $#strs )
        {
            my $str = $strs[$i]->text;
            $str =~ /The traffic on Danube Bridge Vidin - Calafat during the period (\d{1,2}\.\d{1,2}\.\d{4}) - (\d{1,2}\.\d{1,2}\.\d{4}) was around (\d+) vehicles./;
            $$result[$i] = [$self->NormalizeDate($1), $self->NormalizeDate($2), $3];
        }

        $result = [ sort { $$a[0] cmp $$b[0] } @{ $result } ];

        $self->WriteCsv($result);

        print STDERR Dumper($result);
    }
    else
    {
        ERROR "Failed request: " . $resp->status_line;
    }
}

sub WriteCsv($$)
{
    my ($self, $data) = @_;
    my $csv = Text::CSV->new({ binary => 1  });
    my $fh = IO::File->new();
    
    $fh->open( $CSV_FILE, 'r+' )
        or ERROR "Unable to open csv file: $CSV_FILE";

    my @records = reverse $csv->getline_all( $fh, -1, 1 );
    my $last_line = $records[0][0];

    foreach my $new_row (@{ $data  })
    {
        print STDERR $$last_line[0], Dumper ($last_line);
        if($$last_line[0] gt $$new_row[0] || $$last_line[0] eq $$new_row[0]) 
        {
                next;    
        }

        print $fh "\n\r" unless $$data[0] == $new_row;

        INFO "New line printed: " . Dumper($new_row);
        
        $csv->print( $fh, $new_row );
    }
}

sub NormalizeDate($$)
{
    my ($self, $date) = @_;
    my @parts = reverse split '\.', $date;
    my $fdate = join '-', @parts;

    return $fdate;
}

1;
