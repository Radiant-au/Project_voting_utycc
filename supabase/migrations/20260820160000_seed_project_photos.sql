update public.projects
set image_url = case project_number
  when '01' then 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?auto=format&fit=crop&w=1600&q=80'
  when '02' then 'https://images.unsplash.com/photo-1529465230221-a0d10e46fcbb?auto=format&fit=crop&w=1600&q=80'
  when '03' then 'https://images.unsplash.com/photo-1508830524289-0adcbe822b40?auto=format&fit=crop&w=1600&q=80'
  when '04' then 'https://images.unsplash.com/photo-1759884247381-d7222dd72dec?auto=format&fit=crop&w=1600&q=80'
  when '05' then 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?auto=format&fit=crop&w=1600&q=80'
  when '06' then 'https://images.unsplash.com/photo-1748345952129-3bdd7d39f155?auto=format&fit=crop&w=1600&q=80'
  when '07' then 'https://images.unsplash.com/photo-1770777843445-2a1621b1201d?auto=format&fit=crop&w=1600&q=80'
  when '08' then 'https://images.unsplash.com/photo-1748256622734-92241ae7b43f?auto=format&fit=crop&w=1600&q=80'
  when '09' then 'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?auto=format&fit=crop&w=1600&q=80'
  when '10' then 'https://images.unsplash.com/photo-1573867639040-6dd25fa5f597?auto=format&fit=crop&w=1600&q=80'
  when '11' then 'https://images.unsplash.com/photo-1573495628363-04667cedc587?auto=format&fit=crop&w=1600&q=80'
  when '12' then 'https://images.unsplash.com/photo-1763568258445-70fecf4e78af?auto=format&fit=crop&w=1600&q=80'
end
where project_number between '01' and '12';
