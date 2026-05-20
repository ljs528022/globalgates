-- 견적 상태 enum이 잘못 생성된 로컬 DB를 복구하기 위한 migration
-- 기존 estimation_status 에 'requestingreject'가 들어간 경우를 기준으로 정리한다.

do $$
begin
    if exists (
        select 1
        from pg_type t
                 join pg_enum e on t.oid = e.enumtypid
        where t.typname = 'estimation_status'
          and e.enumlabel = 'requestingreject'
    ) then
        create type estimation_status_new as enum ('approve', 'requesting', 'reject');

        alter table tbl_estimation
            alter column status drop default;

        alter table tbl_estimation
            alter column status type estimation_status_new
            using (
                case
                    when status::text = 'requestingreject' then 'requesting'::estimation_status_new
                    else status::text::estimation_status_new
                    end
                );

        alter table tbl_estimation
            alter column status set default 'approve'::estimation_status_new;

        drop type estimation_status;
        alter type estimation_status_new rename to estimation_status;
    end if;
end $$;
