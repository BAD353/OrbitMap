create table if not exists satellites (
    norad_id text primary key,
    name text,
    intl_designator text,
    country text,
    object_type text,
    launch_date date,
    decay_date date,
    updated_at timestamptz not null default now()
);

create table if not exists elsets (
    norad_id text not null references satellites,
    epoch timestamptz not null,
    inclination double precision,
    right_ascension double precision,
    eccentricity double precision,
    perigee_argument double precision,
    mean_anomaly double precision,
    mean_motion double precision,
    b_star double precision,
    rev_num_at_epoch bigint,

    mean_motion_dot double precision,
    mean_motion_ddot double precision,
    creation_date timestamptz,
    gp_id bigint,
    semimajor_axis double precision,
    period double precision,
    apoapsis double precision,
    periapsis double precision,
    updated_at timestamptz not null default now(),
    primary key (norad_id, epoch)
);

create table if not exists current_elsets (
    like elsets,
    primary key (norad_id),
    foreign key (norad_id) references satellites
);

create table if not exists database_state(
    id boolean primary key default true,
    seeded boolean not null default false,
    last_epoch timestamptz,
    last_creation_date timestamptz,
    updated_at timestamptz not null default now()
);

insert into database_state(id)
values (true)
on conflict (id) do nothing;